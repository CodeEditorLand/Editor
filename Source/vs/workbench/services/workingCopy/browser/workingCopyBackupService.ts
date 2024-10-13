/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { joinPath } from "../../../../base/common/resources.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import {
	InstantiationType,
	registerSingleton,
} from "../../../../platform/instantiation/common/extensions.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.js";
import {
	registerWorkbenchContribution2,
	WorkbenchPhase,
} from "../../../common/contributions.js";
import { IWorkbenchEnvironmentService } from "../../environment/common/environmentService.js";
import { IWorkingCopyBackupService } from "../common/workingCopyBackup.js";
import { WorkingCopyBackupService } from "../common/workingCopyBackupService.js";
import { BrowserWorkingCopyBackupTracker } from "./workingCopyBackupTracker.js";

export class BrowserWorkingCopyBackupService extends WorkingCopyBackupService {
	constructor(
		@IWorkspaceContextService contextService: IWorkspaceContextService,
		@IWorkbenchEnvironmentService
		environmentService: IWorkbenchEnvironmentService,
		@IFileService fileService: IFileService,
		@ILogService logService: ILogService,
	) {
		super(
			joinPath(
				environmentService.userRoamingDataHome,
				"Backups",
				contextService.getWorkspace().id,
			),
			fileService,
			logService,
		);
	}
}

// Register Service
registerSingleton(
	IWorkingCopyBackupService,
	BrowserWorkingCopyBackupService,
	InstantiationType.Eager,
);

// Register Backup Tracker
registerWorkbenchContribution2(
	BrowserWorkingCopyBackupTracker.ID,
	BrowserWorkingCopyBackupTracker,
	WorkbenchPhase.BlockStartup,
);
