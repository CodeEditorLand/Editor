/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { registerSharedProcessRemoteService } from "../../ipc/electron-sandbox/services.js";
import { IDiagnosticsService } from "../common/diagnostics.js";

registerSharedProcessRemoteService(IDiagnosticsService, "diagnostics");
