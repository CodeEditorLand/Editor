/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { SyncDescriptor } from "../../../platform/instantiation/common/descriptors.js";
import {
	InstantiationType,
	registerSingleton,
} from "../../../platform/instantiation/common/extensions.js";
import {
	ILoggerService,
	ILogService,
} from "../../../platform/log/common/log.js";
import { ISignService } from "../../../platform/sign/common/sign.js";
import { SignService } from "../../../platform/sign/node/signService.js";
import { IExtHostDebugService } from "../common/extHostDebugService.js";
import { IExtHostExtensionService } from "../common/extHostExtensionService.js";
import { ExtHostLogService } from "../common/extHostLogService.js";
import { IExtHostSearch } from "../common/extHostSearch.js";
import { IExtensionStoragePaths } from "../common/extHostStoragePaths.js";
import { IExtHostTask } from "../common/extHostTask.js";
import { IExtHostTerminalService } from "../common/extHostTerminalService.js";
import { IExtHostTunnelService } from "../common/extHostTunnelService.js";
import { IExtHostVariableResolverProvider } from "../common/extHostVariableResolverService.js";
import { ExtHostDebugService } from "./extHostDebugService.js";
import { ExtHostExtensionService } from "./extHostExtensionService.js";
import { ExtHostLoggerService } from "./extHostLoggerService.js";
import { NativeExtHostSearch } from "./extHostSearch.js";
import { ExtensionStoragePaths } from "./extHostStoragePaths.js";
import { ExtHostTask } from "./extHostTask.js";
import { ExtHostTerminalService } from "./extHostTerminalService.js";
import { NodeExtHostTunnelService } from "./extHostTunnelService.js";
import { NodeExtHostVariableResolverProviderService } from "./extHostVariableResolverService.js";

// #########################################################################
// ###                                                                   ###
// ### !!! PLEASE ADD COMMON IMPORTS INTO extHost.common.services.ts !!! ###
// ###                                                                   ###
// #########################################################################

registerSingleton(
	IExtHostExtensionService,
	ExtHostExtensionService,
	InstantiationType.Eager,
);
registerSingleton(
	ILoggerService,
	ExtHostLoggerService,
	InstantiationType.Delayed,
);
registerSingleton(
	ILogService,
	new SyncDescriptor(ExtHostLogService, [false], true),
);
registerSingleton(ISignService, SignService, InstantiationType.Delayed);
registerSingleton(
	IExtensionStoragePaths,
	ExtensionStoragePaths,
	InstantiationType.Eager,
);

registerSingleton(
	IExtHostDebugService,
	ExtHostDebugService,
	InstantiationType.Eager,
);
registerSingleton(IExtHostSearch, NativeExtHostSearch, InstantiationType.Eager);
registerSingleton(IExtHostTask, ExtHostTask, InstantiationType.Eager);
registerSingleton(
	IExtHostTerminalService,
	ExtHostTerminalService,
	InstantiationType.Eager,
);
registerSingleton(
	IExtHostTunnelService,
	NodeExtHostTunnelService,
	InstantiationType.Eager,
);
registerSingleton(
	IExtHostVariableResolverProvider,
	NodeExtHostVariableResolverProviderService,
	InstantiationType.Eager,
);
