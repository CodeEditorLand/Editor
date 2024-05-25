/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import type TypeScriptServiceClientHost from "../typeScriptServiceClientHost";
import type { TypeScriptRequests } from "../typescriptService";
import { nulToken } from "../utils/cancellation";
import type { Lazy } from "../utils/lazy";
import type { Command } from "./commandManager";

export class TSServerRequestCommand implements Command {
	public readonly id = "typescript.tsserverRequest";

	public constructor(
		private readonly lazyClientHost: Lazy<TypeScriptServiceClientHost>,
	) {}

	public execute(
		requestID: keyof TypeScriptRequests,
		args?: any,
		config?: any,
	) {
		// A cancellation token cannot be passed through the command infrastructure
		const token = nulToken;

		// The list can be found in the TypeScript compiler as `const enum CommandTypes`,
		// to avoid extensions making calls which could affect the internal tsserver state
		// these are only read-y sorts of commands
		const allowList = [
			// Seeing the JS/DTS output for a file
			"emit-output",
			// Grabbing a file's diagnostics
			"semanticDiagnosticsSync",
			"syntacticDiagnosticsSync",
			"suggestionDiagnosticsSync",
			// Introspecting code at a position
			"quickinfo",
			"quickinfo-full",
			"completionInfo",
		];

		if (!allowList.includes(requestID)) {
			return;
		}
		return this.lazyClientHost.value.serviceClient.execute(
			requestID,
			args,
			token,
			config,
		);
	}
}
