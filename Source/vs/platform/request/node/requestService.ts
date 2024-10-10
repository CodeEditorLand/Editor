/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as http from 'http';
import * as https from 'https';
import { parse as parseUrl } from 'url';
import { Promises } from '../../../base/common/async.js';
import { streamToBufferReadableStream } from '../../../base/common/buffer.js';
import { CancellationToken } from '../../../base/common/cancellation.js';
import { CancellationError, getErrorMessage } from '../../../base/common/errors.js';
import * as streams from '../../../base/common/stream.js';
import { isBoolean, isNumber } from '../../../base/common/types.js';
import { IRequestContext, IRequestOptions } from '../../../base/parts/request/common/request.js';
import { IConfigurationService } from '../../configuration/common/configuration.js';
import { INativeEnvironmentService } from '../../environment/common/environment.js';
import { getResolvedShellEnv } from '../../shell/node/shellEnv.js';
import { ILogService } from '../../log/common/log.js';
import { AbstractRequestService, AuthInfo, Credentials, IRequestService } from '../common/request.js';
import { Agent, getProxyAgent } from './proxy.js';
import { createGunzip } from 'zlib';

interface IHTTPConfiguration {
	proxy?: string;
	proxyStrictSSL?: boolean;
	proxyAuthorization?: string;
}

export interface IRawRequestFunction {
	(options: http.RequestOptions, callback?: (res: http.IncomingMessage) => void): http.ClientRequest;
}

export interface NodeRequestOptions extends IRequestOptions {
	agent?: Agent;
	strictSSL?: boolean;
	isChromiumNetwork?: boolean;
	getRawRequest?(options: IRequestOptions): IRawRequestFunction;
}

/**
 * This service exposes the `request` API, while using the global
 * or configured proxy settings.
 */
export class RequestService extends AbstractRequestService implements IRequestService {

	declare readonly _serviceBrand: undefined;

	private proxyUrl?: string;
	private strictSSL: boolean | undefined;
	private authorization?: string;
	private shellEnvErrorLogged?: boolean;

	constructor(
		@IConfigurationService private readonly configurationService: IConfigurationService,
		@INativeEnvironmentService private readonly environmentService: INativeEnvironmentService,
		@ILogService logService: ILogService,
	) {
		super(logService);
		this.configure();
		this._register(configurationService.onDidChangeConfiguration(e => {
			if (e.affectsConfiguration('http')) {
				this.configure();
			}
		}));
	}

	private configure() {
		const config = this.configurationService.getValue<IHTTPConfiguration | undefined>('http');

		this.proxyUrl = config?.proxy;
		this.strictSSL = !!config?.proxyStrictSSL;
		this.authorization = config?.proxyAuthorization;
	}

	async request(options: NodeRequestOptions, token: CancellationToken): Promise<IRequestContext> {
		const { proxyUrl, strictSSL } = this;

		let shellEnv: typeof process.env | undefined = undefined;
		try {
			shellEnv = await getResolvedShellEnv(this.configurationService, this.logService, this.environmentService.args, process.env);
		} catch (error) {
			if (!this.shellEnvErrorLogged) {
				this.shellEnvErrorLogged = true;
				this.logService.error(`resolving shell environment failed`, getErrorMessage(error));
			}
		}

		const env = {
			...process.env,
			...shellEnv
		};
		const agent = options.agent ? options.agent : await getProxyAgent(options.url || '', env, { proxyUrl, strictSSL });

		options.agent = agent;
		options.strictSSL = strictSSL;

		if (this.authorization) {
			options.headers = {
				...(options.headers || {}),
				'Proxy-Authorization': this.authorization
			};
		}

		return this.logAndRequest(options, () => nodeRequest(options, token));
	}

	async resolveProxy(url: string): Promise<string | undefined> {
		return undefined; // currently not implemented in node
	}

	async lookupAuthorization(authInfo: AuthInfo): Promise<Credentials | undefined> {
		return undefined; // currently not implemented in node
	}

	async lookupKerberosAuthorization(urlStr: string): Promise<string | undefined> {
		try {
			const kerberos = await import('kerberos');
			const url = new URL(urlStr);
			const spn = this.configurationService.getValue<string>('http.proxyKerberosServicePrincipal')
				|| (process.platform === 'win32' ? `HTTP/${url.hostname}` : `HTTP@${url.hostname}`);
			this.logService.debug('RequestService#lookupKerberosAuthorization Kerberos authentication lookup', `proxyURL:${url}`, `spn:${spn}`);
			const client = await kerberos.initializeClient(spn);
			const response = await client.step('');
			return 'Negotiate ' + response;
		} catch (err) {
			this.logService.debug('RequestService#lookupKerberosAuthorization Kerberos authentication failed', err);
			return undefined;
		}
	}

	async loadCertificates(): Promise<string[]> {
		const proxyAgent = await import('@vscode/proxy-agent');
		return proxyAgent.loadSystemCertificates({ log: this.logService });
	}
}

async function getNodeRequest(options: IRequestOptions): Promise<IRawRequestFunction> {
	const endpoint = parseUrl(options.url!);
	const module = endpoint.protocol === 'https:' ? await import('https') : await import('http');

	return module.request;
}

export async function nodeRequest(options: NodeRequestOptions, token: CancellationToken): Promise<IRequestContext> {
	return Promises.withAsyncBody<IRequestContext>(async (resolve, reject) => {
		const endpoint = parseUrl(options.url!);
		const rawRequest = options.getRawRequest
			? options.getRawRequest(options)
			: await getNodeRequest(options);

		const opts: https.RequestOptions = {
			hostname: endpoint.hostname,
			port: endpoint.port ? parseInt(endpoint.port) : (endpoint.protocol === 'https:' ? 443 : 80),
			protocol: endpoint.protocol,
			path: endpoint.path,
			method: options.type || 'GET',
			headers: options.headers,
			agent: options.agent,
			rejectUnauthorized: isBoolean(options.strictSSL) ? options.strictSSL : true
		};

		if (options.user && options.password) {
			opts.auth = options.user + ':' + options.password;
		}

		const req = rawRequest(opts, (res: http.IncomingMessage) => {
			const followRedirects: number = isNumber(options.followRedirects) ? options.followRedirects : 3;
			if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && followRedirects > 0 && res.headers['location']) {
				nodeRequest({
					...options,
					url: res.headers['location'],
					followRedirects: followRedirects - 1
				}, token).then(resolve, reject);
			} else {
				let stream: streams.ReadableStreamEvents<Uint8Array> = res;

				// Responses from Electron net module should be treated as response
				// from browser, which will apply gzip filter and decompress the response
				// using zlib before passing the result to us. Following step can be bypassed
				// in this case and proceed further.

				if (!options.isChromiumNetwork && res.headers['content-encoding'] === 'gzip') {
					stream = res.pipe(createGunzip());
				}

				resolve({ res, stream: streamToBufferReadableStream(stream) } satisfies IRequestContext);
			}
		});

		req.on('error', reject);

		if (options.timeout) {
			req.setTimeout(options.timeout);
		}

		// Chromium will abort the request if forbidden headers are set.

		// for additional context.
		if (options.isChromiumNetwork) {
			req.removeHeader('Content-Length');
		}

		if (options.data) {
			if (typeof options.data === 'string') {
				req.write(options.data);
			}
		}

		req.end();

		token.onCancellationRequested(() => {
			req.abort();

			reject(new CancellationError());
		});
	});
}
