/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { tmpdir } from "os";

import { Disposable } from "../../../base/common/lifecycle.js";
import { join } from "../../../base/common/path.js";
import { URI } from "../../../base/common/uri.js";
import { generateUuid } from "../../../base/common/uuid.js";
import { MainContext } from "../common/extHost.protocol.js";
import { IExtHostCommands } from "../common/extHostCommands.js";
import { IExtHostRpcService } from "../common/extHostRpcService.js";

export class ExtHostDownloadService extends Disposable {
	constructor(
		@IExtHostRpcService extHostRpc: IExtHostRpcService,
		@IExtHostCommands commands: IExtHostCommands,
	) {
		super();

		const proxy = extHostRpc.getProxy(
			MainContext.MainThreadDownloadService,
		);

		commands.registerCommand(
			false,
			"_workbench.downloadResource",
			async (resource: URI): Promise<any> => {
				const location = URI.file(join(tmpdir(), generateUuid()));
				await proxy.$download(resource, location);
				return location;
			},
		);
	}
}
