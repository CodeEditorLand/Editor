/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Disposable } from "../../../base/common/lifecycle.js";
import { URI, UriComponents } from "../../../base/common/uri.js";
import { IDownloadService } from "../../../platform/download/common/download.js";
import {
	extHostNamedCustomer,
	IExtHostContext,
} from "../../services/extensions/common/extHostCustomers.js";
import {
	MainContext,
	MainThreadDownloadServiceShape,
} from "../common/extHost.protocol.js";

@extHostNamedCustomer(MainContext.MainThreadDownloadService)
export class MainThreadDownloadService
	extends Disposable
	implements MainThreadDownloadServiceShape
{
	constructor(
		extHostContext: IExtHostContext,
		@IDownloadService private readonly downloadService: IDownloadService,
	) {
		super();
	}

	$download(uri: UriComponents, to: UriComponents): Promise<void> {
		return this.downloadService.download(URI.revive(uri), URI.revive(to));
	}
}
