/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import type { IGrammar } from "vscode-textmate";

import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";

export const ITextMateTokenizationService =
	createDecorator<ITextMateTokenizationService>(
		"textMateTokenizationFeature",
	);

export interface ITextMateTokenizationService {
	readonly _serviceBrand: undefined;

	createTokenizer(languageId: string): Promise<IGrammar | null>;

	startDebugMode(printFn: (str: string) => void, onStop: () => void): void;
}
