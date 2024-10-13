/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import {
	InstantiationType,
	registerSingleton,
} from "../../../../platform/instantiation/common/extensions.js";
import {
	IWorkbenchContribution,
	registerWorkbenchContribution2,
	WorkbenchPhase,
} from "../../../common/contributions.js";
import { ITextMateTokenizationService } from "./textMateTokenizationFeature.js";
import { TextMateTokenizationFeature } from "./textMateTokenizationFeatureImpl.js";

/**
 * Makes sure the ITextMateTokenizationService is instantiated
 */
class TextMateTokenizationInstantiator implements IWorkbenchContribution {
	static readonly ID = "workbench.contrib.textMateTokenizationInstantiator";

	constructor(
		@ITextMateTokenizationService
		_textMateTokenizationService: ITextMateTokenizationService,
	) {}
}

registerSingleton(
	ITextMateTokenizationService,
	TextMateTokenizationFeature,
	InstantiationType.Eager,
);

registerWorkbenchContribution2(
	TextMateTokenizationInstantiator.ID,
	TextMateTokenizationInstantiator,
	WorkbenchPhase.BlockRestore,
);
