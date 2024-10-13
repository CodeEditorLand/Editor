/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { createDecorator } from "../../instantiation/common/instantiation.js";
import { IExternalTerminalService } from "../common/externalTerminal.js";

export const IExternalTerminalMainService =
	createDecorator<IExternalTerminalMainService>("externalTerminal");

export interface IExternalTerminalMainService extends IExternalTerminalService {
	readonly _serviceBrand: undefined;
}
