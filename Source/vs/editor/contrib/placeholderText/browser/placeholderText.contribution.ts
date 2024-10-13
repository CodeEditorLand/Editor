/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import "./placeholderText.css";

import { localize } from "../../../../nls.js";
import { wrapInReloadableClass1 } from "../../../../platform/observable/common/wrapInReloadableClass.js";
import { registerColor } from "../../../../platform/theme/common/colorUtils.js";
import {
	EditorContributionInstantiation,
	registerEditorContribution,
} from "../../../browser/editorExtensions.js";
import { ghostTextForeground } from "../../../common/core/editorColorRegistry.js";
import { PlaceholderTextContribution } from "./placeholderTextContribution.js";

registerEditorContribution(
	PlaceholderTextContribution.ID,
	wrapInReloadableClass1(() => PlaceholderTextContribution),
	EditorContributionInstantiation.Eager,
);

registerColor(
	"editor.placeholder.foreground",
	ghostTextForeground,
	localize(
		"placeholderForeground",
		"Foreground color of the placeholder text in the editor.",
	),
);
