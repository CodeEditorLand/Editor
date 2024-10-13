/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import {
	InstantiationType,
	registerSingleton,
} from "../../../../platform/instantiation/common/extensions.js";
import { IEnvironmentVariableService } from "./environmentVariable.js";
import { EnvironmentVariableService } from "./environmentVariableService.js";

registerSingleton(
	IEnvironmentVariableService,
	EnvironmentVariableService,
	InstantiationType.Delayed,
);
