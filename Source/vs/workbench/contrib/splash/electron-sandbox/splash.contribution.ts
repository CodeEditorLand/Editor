/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import {
	InstantiationType,
	registerSingleton,
} from "../../../../platform/instantiation/common/extensions.js";
import { INativeHostService } from "../../../../platform/native/common/native.js";
import { IPartsSplash } from "../../../../platform/theme/common/themeService.js";
import {
	registerWorkbenchContribution2,
	WorkbenchPhase,
} from "../../../common/contributions.js";
import { PartsSplash } from "../browser/partsSplash.js";
import { ISplashStorageService } from "../browser/splash.js";

class SplashStorageService implements ISplashStorageService {
	_serviceBrand: undefined;
	readonly saveWindowSplash: (splash: IPartsSplash) => Promise<void>;

	constructor(@INativeHostService nativeHostService: INativeHostService) {
		this.saveWindowSplash =
			nativeHostService.saveWindowSplash.bind(nativeHostService);
	}
}

registerSingleton(
	ISplashStorageService,
	SplashStorageService,
	InstantiationType.Delayed,
);

registerWorkbenchContribution2(
	PartsSplash.ID,
	PartsSplash,
	WorkbenchPhase.BlockStartup,
);
