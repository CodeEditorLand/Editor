/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import {
	InstantiationType,
	registerSingleton,
} from "../../instantiation/common/extensions.js";
import { IMenuService, registerAction2 } from "./actions.js";
import { MenuHiddenStatesReset } from "./menuResetAction.js";
import { MenuService } from "./menuService.js";

registerSingleton(IMenuService, MenuService, InstantiationType.Delayed);

registerAction2(MenuHiddenStatesReset);
