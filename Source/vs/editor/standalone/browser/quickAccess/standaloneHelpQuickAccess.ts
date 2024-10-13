/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { HelpQuickAccessProvider } from "../../../../platform/quickinput/browser/helpQuickAccess.js";
import {
	Extensions,
	IQuickAccessRegistry,
} from "../../../../platform/quickinput/common/quickAccess.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { QuickHelpNLS } from "../../../common/standaloneStrings.js";

Registry.as<IQuickAccessRegistry>(
	Extensions.Quickaccess,
).registerQuickAccessProvider({
	ctor: HelpQuickAccessProvider,
	prefix: "",
	helpEntries: [{ description: QuickHelpNLS.helpQuickAccessActionLabel }],
});
