/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

/* eslint-disable no-restricted-globals */

(function () {

	type IBootstrapWindow = import('vs/platform/window/electron-sandbox/window.js').IBootstrapWindow;
	const bootstrapWindow: IBootstrapWindow = (window as any).MonacoBootstrapWindow; // defined by bootstrap-window.ts

	bootstrapWindow.load('vs/code/electron-sandbox/processExplorer/processExplorerMain', function (processExplorer, configuration) {
		return processExplorer.startup(configuration);
	}, {
		configureDeveloperSettings: function () {
			return {
				forceEnableDeveloperKeybindings: true
			};
		},
	});
}());
