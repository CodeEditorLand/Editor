/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import {
	InstantiationType,
	registerSingleton,
} from "../../../platform/instantiation/common/extensions.js";
import { ILoggerService } from "../../../platform/log/common/log.js";
import {
	ExtHostApiDeprecationService,
	IExtHostApiDeprecationService,
} from "./extHostApiDeprecationService.js";
import {
	ExtHostAuthentication,
	IExtHostAuthentication,
} from "./extHostAuthentication.js";
import { ExtHostCommands, IExtHostCommands } from "./extHostCommands.js";
import {
	ExtHostConfiguration,
	IExtHostConfiguration,
} from "./extHostConfiguration.js";
import {
	IExtHostDebugService,
	WorkerExtHostDebugService,
} from "./extHostDebugService.js";
import {
	ExtHostDecorations,
	IExtHostDecorations,
} from "./extHostDecorations.js";
import {
	ExtHostDocumentsAndEditors,
	IExtHostDocumentsAndEditors,
} from "./extHostDocumentsAndEditors.js";
import { ExtHostEditorTabs, IExtHostEditorTabs } from "./extHostEditorTabs.js";
import {
	ExtHostConsumerFileSystem,
	IExtHostConsumerFileSystem,
} from "./extHostFileSystemConsumer.js";
import {
	ExtHostFileSystemInfo,
	IExtHostFileSystemInfo,
} from "./extHostFileSystemInfo.js";
import {
	ExtHostLanguageModels,
	IExtHostLanguageModels,
} from "./extHostLanguageModels.js";
import {
	ExtHostLocalizationService,
	IExtHostLocalizationService,
} from "./extHostLocalizationService.js";
import { ExtHostLoggerService } from "./extHostLoggerService.js";
import {
	ExtHostManagedSockets,
	IExtHostManagedSockets,
} from "./extHostManagedSockets.js";
import {
	ExtHostOutputService,
	IExtHostOutputService,
} from "./extHostOutput.js";
import { ExtHostSearch, IExtHostSearch } from "./extHostSearch.js";
import {
	ExtHostSecretState,
	IExtHostSecretState,
} from "./extHostSecretState.js";
import { ExtHostStorage, IExtHostStorage } from "./extHostStorage.js";
import { IExtHostTask, WorkerExtHostTask } from "./extHostTask.js";
import { ExtHostTelemetry, IExtHostTelemetry } from "./extHostTelemetry.js";
import {
	IExtHostTerminalService,
	WorkerExtHostTerminalService,
} from "./extHostTerminalService.js";
import {
	ExtHostTerminalShellIntegration,
	IExtHostTerminalShellIntegration,
} from "./extHostTerminalShellIntegration.js";
import { ExtHostTesting, IExtHostTesting } from "./extHostTesting.js";
import {
	ExtHostTunnelService,
	IExtHostTunnelService,
} from "./extHostTunnelService.js";
import {
	ExtHostVariableResolverProviderService,
	IExtHostVariableResolverProvider,
} from "./extHostVariableResolverService.js";
import { ExtHostWindow, IExtHostWindow } from "./extHostWindow.js";
import { ExtHostWorkspace, IExtHostWorkspace } from "./extHostWorkspace.js";

registerSingleton(
	IExtHostLocalizationService,
	ExtHostLocalizationService,
	InstantiationType.Delayed,
);
registerSingleton(
	ILoggerService,
	ExtHostLoggerService,
	InstantiationType.Delayed,
);
registerSingleton(
	IExtHostApiDeprecationService,
	ExtHostApiDeprecationService,
	InstantiationType.Delayed,
);
registerSingleton(IExtHostCommands, ExtHostCommands, InstantiationType.Eager);
registerSingleton(
	IExtHostAuthentication,
	ExtHostAuthentication,
	InstantiationType.Eager,
);
registerSingleton(
	IExtHostLanguageModels,
	ExtHostLanguageModels,
	InstantiationType.Eager,
);
registerSingleton(
	IExtHostConfiguration,
	ExtHostConfiguration,
	InstantiationType.Eager,
);
registerSingleton(
	IExtHostConsumerFileSystem,
	ExtHostConsumerFileSystem,
	InstantiationType.Eager,
);
registerSingleton(IExtHostTesting, ExtHostTesting, InstantiationType.Eager);
registerSingleton(
	IExtHostDebugService,
	WorkerExtHostDebugService,
	InstantiationType.Eager,
);
registerSingleton(
	IExtHostDecorations,
	ExtHostDecorations,
	InstantiationType.Eager,
);
registerSingleton(
	IExtHostDocumentsAndEditors,
	ExtHostDocumentsAndEditors,
	InstantiationType.Eager,
);
registerSingleton(
	IExtHostManagedSockets,
	ExtHostManagedSockets,
	InstantiationType.Eager,
);
registerSingleton(
	IExtHostFileSystemInfo,
	ExtHostFileSystemInfo,
	InstantiationType.Eager,
);
registerSingleton(
	IExtHostOutputService,
	ExtHostOutputService,
	InstantiationType.Delayed,
);
registerSingleton(IExtHostSearch, ExtHostSearch, InstantiationType.Eager);
registerSingleton(IExtHostStorage, ExtHostStorage, InstantiationType.Eager);
registerSingleton(IExtHostTask, WorkerExtHostTask, InstantiationType.Eager);
registerSingleton(
	IExtHostTerminalService,
	WorkerExtHostTerminalService,
	InstantiationType.Eager,
);
registerSingleton(
	IExtHostTerminalShellIntegration,
	ExtHostTerminalShellIntegration,
	InstantiationType.Eager,
);
registerSingleton(
	IExtHostTunnelService,
	ExtHostTunnelService,
	InstantiationType.Eager,
);
registerSingleton(IExtHostWindow, ExtHostWindow, InstantiationType.Eager);
registerSingleton(IExtHostWorkspace, ExtHostWorkspace, InstantiationType.Eager);
registerSingleton(
	IExtHostSecretState,
	ExtHostSecretState,
	InstantiationType.Eager,
);
registerSingleton(IExtHostTelemetry, ExtHostTelemetry, InstantiationType.Eager);
registerSingleton(
	IExtHostEditorTabs,
	ExtHostEditorTabs,
	InstantiationType.Eager,
);
registerSingleton(
	IExtHostVariableResolverProvider,
	ExtHostVariableResolverProviderService,
	InstantiationType.Eager,
);
