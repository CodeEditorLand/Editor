/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { OS, OperatingSystem } from "../../../base/common/platform.js";
import * as nls from "../../../nls.js";
import type { IConfigurationService } from "../../configuration/common/configuration.js";
import {
	Extensions as ConfigExtensions,
	ConfigurationScope,
	type IConfigurationNode,
	type IConfigurationRegistry,
} from "../../configuration/common/configurationRegistry.js";
import { Registry } from "../../registry/common/platform.js";

export enum DispatchConfig {
	Code = 0,
	KeyCode = 1,
}

export interface IKeyboardConfig {
	dispatch: DispatchConfig;
	mapAltGrToCtrlAlt: boolean;
}

export function readKeyboardConfig(
	configurationService: IConfigurationService,
): IKeyboardConfig {
	const keyboard = configurationService.getValue<
		{ dispatch: any; mapAltGrToCtrlAlt: any } | undefined
	>("keyboard");
	const dispatch =
		keyboard?.dispatch === "keyCode"
			? DispatchConfig.KeyCode
			: DispatchConfig.Code;
	const mapAltGrToCtrlAlt = Boolean(keyboard?.mapAltGrToCtrlAlt);
	return { dispatch, mapAltGrToCtrlAlt };
}

const configurationRegistry = Registry.as<IConfigurationRegistry>(
	ConfigExtensions.Configuration,
);
const keyboardConfiguration: IConfigurationNode = {
	id: "keyboard",
	order: 15,
	type: "object",
	title: nls.localize("keyboardConfigurationTitle", "Keyboard"),
	properties: {
		"keyboard.dispatch": {
			scope: ConfigurationScope.APPLICATION,
			type: "string",
			enum: ["code", "keyCode"],
			default: "code",
			markdownDescription: nls.localize(
				"dispatch",
				"Controls the dispatching logic for key presses to use either `code` (recommended) or `keyCode`.",
			),
			included:
				OS === OperatingSystem.Macintosh ||
				OS === OperatingSystem.Linux,
		},
		"keyboard.mapAltGrToCtrlAlt": {
			scope: ConfigurationScope.APPLICATION,
			type: "boolean",
			default: false,
			markdownDescription: nls.localize(
				"mapAltGrToCtrlAlt",
				"Controls if the AltGraph+ modifier should be treated as Ctrl+Alt+.",
			),
			included: OS === OperatingSystem.Windows,
		},
	},
};

configurationRegistry.registerConfiguration(keyboardConfiguration);
