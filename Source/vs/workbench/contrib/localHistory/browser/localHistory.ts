/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Codicon } from "../../../../base/common/codicons.js";
import { language } from "../../../../base/common/platform.js";
import { localize } from "../../../../nls.js";
import { ContextKeyExpr } from "../../../../platform/contextkey/common/contextkey.js";
import { registerIcon } from "../../../../platform/theme/common/iconRegistry.js";

interface ILocalHistoryDateFormatter {
	format: (timestamp: number) => string;
}

let localHistoryDateFormatter: ILocalHistoryDateFormatter | undefined =
	undefined;

export function getLocalHistoryDateFormatter(): ILocalHistoryDateFormatter {
	if (!localHistoryDateFormatter) {
		const options: Intl.DateTimeFormatOptions = {
			year: "numeric",
			month: "long",
			day: "numeric",
			hour: "numeric",
			minute: "numeric",
		};

		let formatter: Intl.DateTimeFormat;
		try {
			formatter = new Intl.DateTimeFormat(language, options);
		} catch (error) {
			formatter = new Intl.DateTimeFormat(undefined, options); // error can happen when language is invalid (https://github.com/microsoft/vscode/issues/147086)
		}

		localHistoryDateFormatter = {
			format: (date) => formatter.format(date),
		};
	}

	return localHistoryDateFormatter;
}

export const LOCAL_HISTORY_MENU_CONTEXT_VALUE = "localHistory:item";
export const LOCAL_HISTORY_MENU_CONTEXT_KEY = ContextKeyExpr.equals(
	"timelineItem",
	LOCAL_HISTORY_MENU_CONTEXT_VALUE,
);

export const LOCAL_HISTORY_ICON_ENTRY = registerIcon(
	"localHistory-icon",
	Codicon.circleOutline,
	localize(
		"localHistoryIcon",
		"Icon for a local history entry in the timeline view.",
	),
);
export const LOCAL_HISTORY_ICON_RESTORE = registerIcon(
	"localHistory-restore",
	Codicon.check,
	localize(
		"localHistoryRestore",
		"Icon for restoring contents of a local history entry.",
	),
);
