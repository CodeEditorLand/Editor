/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Event } from "../../../base/common/event.js";
import { Disposable, toDisposable } from "../../../base/common/lifecycle.js";
import { isNumber } from "../../../base/common/types.js";
import { URI, type UriComponents } from "../../../base/common/uri.js";
import { Registry } from "../../../platform/registry/common/platform.js";
import {
	type IExtHostContext,
	extHostNamedCustomer,
} from "../../services/extensions/common/extHostCustomers.js";
import {
	Extensions,
	type IOutputChannel,
	type IOutputChannelRegistry,
	IOutputService,
	OUTPUT_VIEW_ID,
	OutputChannelUpdateMode,
} from "../../services/output/common/output.js";
import { IViewsService } from "../../services/views/common/viewsService.js";
import {
	ExtHostContext,
	type ExtHostOutputServiceShape,
	MainContext,
	type MainThreadOutputServiceShape,
} from "../common/extHost.protocol.js";

@extHostNamedCustomer(MainContext.MainThreadOutputService)
export class MainThreadOutputService
	extends Disposable
	implements MainThreadOutputServiceShape
{
	private static _extensionIdPool = new Map<string, number>();

	private readonly _proxy: ExtHostOutputServiceShape;
	private readonly _outputService: IOutputService;
	private readonly _viewsService: IViewsService;

	constructor(
		extHostContext: IExtHostContext,
		@IOutputService outputService: IOutputService,
		@IViewsService viewsService: IViewsService,
	) {
		super();
		this._outputService = outputService;
		this._viewsService = viewsService;

		this._proxy = extHostContext.getProxy(
			ExtHostContext.ExtHostOutputService,
		);

		const setVisibleChannel = () => {
			const visibleChannel = this._viewsService.isViewVisible(
				OUTPUT_VIEW_ID,
			)
				? this._outputService.getActiveChannel()
				: undefined;
			this._proxy.$setVisibleChannel(
				visibleChannel ? visibleChannel.id : null,
			);
		};
		this._register(
			Event.any<any>(
				this._outputService.onActiveOutputChannel,
				Event.filter(
					this._viewsService.onDidChangeViewVisibility,
					({ id }) => id === OUTPUT_VIEW_ID,
				),
			)(() => setVisibleChannel()),
		);
		setVisibleChannel();
	}

	public async $register(
		label: string,
		file: UriComponents,
		languageId: string | undefined,
		extensionId: string,
	): Promise<string> {
		const idCounter =
			(MainThreadOutputService._extensionIdPool.get(extensionId) || 0) +
			1;
		MainThreadOutputService._extensionIdPool.set(extensionId, idCounter);
		const id = `extension-output-${extensionId}-#${idCounter}-${label}`;
		const resource = URI.revive(file);

		Registry.as<IOutputChannelRegistry>(
			Extensions.OutputChannels,
		).registerChannel({
			id,
			label,
			file: resource,
			log: false,
			languageId,
			extensionId,
		});
		this._register(toDisposable(() => this.$dispose(id)));
		return id;
	}

	public async $update(
		channelId: string,
		mode: OutputChannelUpdateMode,
		till?: number,
	): Promise<void> {
		const channel = this._getChannel(channelId);
		if (channel) {
			if (mode === OutputChannelUpdateMode.Append) {
				channel.update(mode);
			} else if (isNumber(till)) {
				channel.update(mode, till);
			}
		}
	}

	public async $reveal(
		channelId: string,
		preserveFocus: boolean,
	): Promise<void> {
		const channel = this._getChannel(channelId);
		if (channel) {
			this._outputService.showChannel(channel.id, preserveFocus);
		}
	}

	public async $close(channelId: string): Promise<void> {
		if (this._viewsService.isViewVisible(OUTPUT_VIEW_ID)) {
			const activeChannel = this._outputService.getActiveChannel();
			if (activeChannel && channelId === activeChannel.id) {
				this._viewsService.closeView(OUTPUT_VIEW_ID);
			}
		}
	}

	public async $dispose(channelId: string): Promise<void> {
		const channel = this._getChannel(channelId);
		channel?.dispose();
	}

	private _getChannel(channelId: string): IOutputChannel | undefined {
		return this._outputService.getChannel(channelId);
	}
}
