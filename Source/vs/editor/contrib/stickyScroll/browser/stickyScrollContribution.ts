/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { registerAction2 } from "../../../../platform/actions/common/actions.js";
import {
	EditorContributionInstantiation,
	registerEditorContribution,
} from "../../../browser/editorExtensions.js";
import {
	FocusStickyScroll,
	GoToStickyScrollLine,
	SelectEditor,
	SelectNextStickyScrollLine,
	SelectPreviousStickyScrollLine,
	ToggleStickyScroll,
} from "./stickyScrollActions.js";
import { StickyScrollController } from "./stickyScrollController.js";

registerEditorContribution(
	StickyScrollController.ID,
	StickyScrollController,
	EditorContributionInstantiation.AfterFirstRender,
);
registerAction2(ToggleStickyScroll);
registerAction2(FocusStickyScroll);
registerAction2(SelectPreviousStickyScrollLine);
registerAction2(SelectNextStickyScrollLine);
registerAction2(GoToStickyScrollLine);
registerAction2(SelectEditor);
