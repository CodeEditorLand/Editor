/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IExtensionHostDebugService } from "../../../../platform/debug/common/extensionHostDebug.js";
import {
	ExtensionHostDebugBroadcastChannel,
	ExtensionHostDebugChannelClient,
} from "../../../../platform/debug/common/extensionHostDebugIpc.js";
import { registerMainProcessRemoteService } from "../../../../platform/ipc/electron-sandbox/services.js";

registerMainProcessRemoteService(
	IExtensionHostDebugService,
	ExtensionHostDebugBroadcastChannel.ChannelName,
	{ channelClientCtor: ExtensionHostDebugChannelClient },
);
