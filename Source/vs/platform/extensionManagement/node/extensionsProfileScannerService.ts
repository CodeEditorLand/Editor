/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { URI } from "../../../base/common/uri.js";
import { INativeEnvironmentService } from "../../environment/common/environment.js";
import { IFileService } from "../../files/common/files.js";
import { ILogService } from "../../log/common/log.js";
import { ITelemetryService } from "../../telemetry/common/telemetry.js";
import { IUriIdentityService } from "../../uriIdentity/common/uriIdentity.js";
import { IUserDataProfilesService } from "../../userDataProfile/common/userDataProfile.js";
import { AbstractExtensionsProfileScannerService } from "../common/extensionsProfileScannerService.js";

export class ExtensionsProfileScannerService extends AbstractExtensionsProfileScannerService {
	constructor(
		@INativeEnvironmentService
		environmentService: INativeEnvironmentService,
		@IFileService fileService: IFileService,
		@IUserDataProfilesService
		userDataProfilesService: IUserDataProfilesService,
		@IUriIdentityService uriIdentityService: IUriIdentityService,
		@ITelemetryService telemetryService: ITelemetryService,
		@ILogService logService: ILogService,
	) {
		super(
			URI.file(environmentService.extensionsPath),
			fileService,
			userDataProfilesService,
			uriIdentityService,
			telemetryService,
			logService,
		);
	}
}
