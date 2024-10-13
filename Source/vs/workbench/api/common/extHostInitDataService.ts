/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { createDecorator } from "../../../platform/instantiation/common/instantiation.js";
import { IExtensionHostInitData } from "../../services/extensions/common/extensionHostProtocol.js";

export const IExtHostInitDataService = createDecorator<IExtHostInitDataService>(
	"IExtHostInitDataService",
);

export interface IExtHostInitDataService
	extends Readonly<IExtensionHostInitData> {
	readonly _serviceBrand: undefined;
}
