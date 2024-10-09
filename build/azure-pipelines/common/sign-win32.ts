/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as path from "path";

import { main } from "./sign";

main([
	process.env["EsrpCliDllPath"]!,
	"sign-windows",
	process.env["ESRPPKI"]!,
	process.env["ESRPAADUsername"]!,
	process.env["ESRPAADPassword"]!,
	path.dirname(process.argv[2]),
	path.basename(process.argv[2]),
]);
