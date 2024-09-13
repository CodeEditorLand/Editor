/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import type { Event } from "../../../../base/common/event.js";
import type { IDisposable } from "../../../../base/common/lifecycle.js";
import type { URI } from "../../../../base/common/uri.js";
import type { LanguageSelector } from "../../../../editor/common/languageSelector.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";

export const IQuickDiffService =
	createDecorator<IQuickDiffService>("quickDiff");

export interface QuickDiffProvider {
	label: string;
	rootUri: URI | undefined;
	selector?: LanguageSelector;
	isSCM: boolean;
	getOriginalResource(uri: URI): Promise<URI | null>;
}

export interface QuickDiff {
	label: string;
	originalResource: URI;
	isSCM: boolean;
}

export interface IQuickDiffService {
	readonly _serviceBrand: undefined;

	readonly onDidChangeQuickDiffProviders: Event<void>;
	addQuickDiffProvider(quickDiff: QuickDiffProvider): IDisposable;
	getQuickDiffs(
		uri: URI,
		language?: string,
		isSynchronized?: boolean,
	): Promise<QuickDiff[]>;
}
