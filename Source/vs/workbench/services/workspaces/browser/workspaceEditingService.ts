/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import type { URI } from "vs/base/common/uri";
import { ICommandService } from "vs/platform/commands/common/commands";
import {
	IDialogService,
	IFileDialogService,
} from "vs/platform/dialogs/common/dialogs";
import { IFileService } from "vs/platform/files/common/files";
import {
	InstantiationType,
	registerSingleton,
} from "vs/platform/instantiation/common/extensions";
import { INotificationService } from "vs/platform/notification/common/notification";
import { IUriIdentityService } from "vs/platform/uriIdentity/common/uriIdentity";
import { IUserDataProfilesService } from "vs/platform/userDataProfile/common/userDataProfile";
import { IWorkspaceContextService } from "vs/platform/workspace/common/workspace";
import { IWorkspaceTrustManagementService } from "vs/platform/workspace/common/workspaceTrust";
import { IWorkspacesService } from "vs/platform/workspaces/common/workspaces";
import type { WorkspaceService } from "vs/workbench/services/configuration/browser/configurationService";
import { IWorkbenchConfigurationService } from "vs/workbench/services/configuration/common/configuration";
import { IJSONEditingService } from "vs/workbench/services/configuration/common/jsonEditing";
import { IWorkbenchEnvironmentService } from "vs/workbench/services/environment/common/environmentService";
import { IHostService } from "vs/workbench/services/host/browser/host";
import { ITextFileService } from "vs/workbench/services/textfile/common/textfiles";
import { IUserDataProfileService } from "vs/workbench/services/userDataProfile/common/userDataProfile";
import { AbstractWorkspaceEditingService } from "vs/workbench/services/workspaces/browser/abstractWorkspaceEditingService";
import { IWorkspaceEditingService } from "vs/workbench/services/workspaces/common/workspaceEditing";

export class BrowserWorkspaceEditingService extends AbstractWorkspaceEditingService {
	constructor(
		@IJSONEditingService jsonEditingService: IJSONEditingService,
		@IWorkspaceContextService contextService: WorkspaceService,
		@IWorkbenchConfigurationService configurationService: IWorkbenchConfigurationService,
		@INotificationService notificationService: INotificationService,
		@ICommandService commandService: ICommandService,
		@IFileService fileService: IFileService,
		@ITextFileService textFileService: ITextFileService,
		@IWorkspacesService workspacesService: IWorkspacesService,
		@IWorkbenchEnvironmentService environmentService: IWorkbenchEnvironmentService,
		@IFileDialogService fileDialogService: IFileDialogService,
		@IDialogService dialogService: IDialogService,
		@IHostService hostService: IHostService,
		@IUriIdentityService uriIdentityService: IUriIdentityService,
		@IWorkspaceTrustManagementService workspaceTrustManagementService: IWorkspaceTrustManagementService,
		@IUserDataProfilesService userDataProfilesService: IUserDataProfilesService,
		@IUserDataProfileService userDataProfileService: IUserDataProfileService,
	) {
		super(
			jsonEditingService,
			contextService,
			configurationService,
			notificationService,
			commandService,
			fileService,
			textFileService,
			workspacesService,
			environmentService,
			fileDialogService,
			dialogService,
			hostService,
			uriIdentityService,
			workspaceTrustManagementService,
			userDataProfilesService,
			userDataProfileService,
		);
	}

	async enterWorkspace(workspaceUri: URI): Promise<void> {
		const result = await this.doEnterWorkspace(workspaceUri);
		if (result) {
			// Open workspace in same window
			await this.hostService.openWindow([{ workspaceUri }], {
				forceReuseWindow: true,
			});
		}
	}
}

registerSingleton(
	IWorkspaceEditingService,
	BrowserWorkspaceEditingService,
	InstantiationType.Delayed,
);
