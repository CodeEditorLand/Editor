/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import "./localHistoryCommands.js";

import {
	registerWorkbenchContribution2,
	WorkbenchPhase,
} from "../../../common/contributions.js";
import { LocalHistoryTimeline } from "./localHistoryTimeline.js";

// Register Local History Timeline
registerWorkbenchContribution2(
	LocalHistoryTimeline.ID,
	LocalHistoryTimeline,
	WorkbenchPhase.BlockRestore /* registrations only */,
);
