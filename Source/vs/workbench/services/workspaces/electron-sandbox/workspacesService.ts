/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { ProxyChannel } from "../../../../base/parts/ipc/common/ipc.js";
import {
	InstantiationType,
	registerSingleton,
} from "../../../../platform/instantiation/common/extensions.js";
import { IMainProcessService } from "../../../../platform/ipc/common/mainProcessService.js";
import { INativeHostService } from "../../../../platform/native/common/native.js";
import { IWorkspacesService } from "../../../../platform/workspaces/common/workspaces.js";

// @ts-ignore: interface is implemented via proxy
export class NativeWorkspacesService implements IWorkspacesService {
	declare readonly _serviceBrand: undefined;

	constructor(
		@IMainProcessService mainProcessService: IMainProcessService,
		@INativeHostService nativeHostService: INativeHostService,
	) {
		return ProxyChannel.toService<IWorkspacesService>(
			mainProcessService.getChannel("workspaces"),
			{ context: nativeHostService.windowId },
		);
	}
}

registerSingleton(
	IWorkspacesService,
	NativeWorkspacesService,
	InstantiationType.Delayed,
);
