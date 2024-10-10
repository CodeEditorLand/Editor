/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

//@ts-check

'use strict';

const path = require('path');
const withBrowserDefaults = require('../shared.webpack.config').browser;

module.exports = withBrowserDefaults({
	context: __dirname,
	node: false,
	entry: {
		extension: './Source/extension.ts',
	},
	resolve: {
		alias: {
			'uuid': path.resolve(__dirname, 'node_modules/uuid/dist/esm-browser/index.js'),
			'./node/authServer': path.resolve(__dirname, 'Source/browser/authServer'),
			'./node/crypto': path.resolve(__dirname, 'Source/browser/crypto'),
			'./node/fetch': path.resolve(__dirname, 'Source/browser/fetch'),
			'./node/buffer': path.resolve(__dirname, 'Source/browser/buffer'),
		}
	}
});
