/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import {
	InstantiationType,
	registerSingleton,
} from "../../../../platform/instantiation/common/extensions.js";
import {
	registerWorkbenchContribution2,
	WorkbenchPhase,
} from "../../../common/contributions.js";
import { IReplaceService } from "./replace.js";
import {
	ReplacePreviewContentProvider,
	ReplaceService,
} from "./replaceService.js";

export function registerContributions(): void {
	registerSingleton(
		IReplaceService,
		ReplaceService,
		InstantiationType.Delayed,
	);
	registerWorkbenchContribution2(
		ReplacePreviewContentProvider.ID,
		ReplacePreviewContentProvider,
		WorkbenchPhase.BlockStartup /* registration only */,
	);
}
