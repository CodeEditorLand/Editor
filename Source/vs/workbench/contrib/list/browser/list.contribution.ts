/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { registerAction2 } from "../../../../platform/actions/common/actions.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import {
	IWorkbenchContribution,
	registerWorkbenchContribution2,
	WorkbenchPhase,
} from "../../../common/contributions.js";
import { ListResizeColumnAction } from "./listResizeColumnAction.js";

export class ListContext implements IWorkbenchContribution {
	static readonly ID = "workbench.contrib.listContext";

	constructor(@IContextKeyService contextKeyService: IContextKeyService) {
		contextKeyService.createKey<boolean>(
			"listSupportsTypeNavigation",
			true,
		);

		// @deprecated in favor of listSupportsTypeNavigation
		contextKeyService.createKey("listSupportsKeyboardNavigation", true);
	}
}

registerWorkbenchContribution2(
	ListContext.ID,
	ListContext,
	WorkbenchPhase.BlockStartup,
);
registerAction2(ListResizeColumnAction);
