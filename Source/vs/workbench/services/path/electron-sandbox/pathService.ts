/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import {
	InstantiationType,
	registerSingleton,
} from "../../../../platform/instantiation/common/extensions.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.js";
import { INativeWorkbenchEnvironmentService } from "../../environment/electron-sandbox/environmentService.js";
import { IRemoteAgentService } from "../../remote/common/remoteAgentService.js";
import { AbstractPathService, IPathService } from "../common/pathService.js";

export class NativePathService extends AbstractPathService {
	constructor(
		@IRemoteAgentService remoteAgentService: IRemoteAgentService,
		@INativeWorkbenchEnvironmentService
		environmentService: INativeWorkbenchEnvironmentService,
		@IWorkspaceContextService contextService: IWorkspaceContextService,
	) {
		super(
			environmentService.userHome,
			remoteAgentService,
			environmentService,
			contextService,
		);
	}
}

registerSingleton(IPathService, NativePathService, InstantiationType.Delayed);
