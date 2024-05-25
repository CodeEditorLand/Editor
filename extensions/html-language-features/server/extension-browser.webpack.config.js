const withBrowserDefaults = require("../../shared.webpack.config").browser;
const path = require("path");

const serverConfig = withBrowserDefaults({
	context: __dirname,
	entry: {
		extension: "./src/browser/htmlServerWorkerMain.ts",
	},
	output: {
		filename: "htmlServerMain.js",
		path: path.join(__dirname, "dist", "browser"),
		libraryTarget: "var",
		library: "serverExportVar",
	},
	optimization: {
		splitChunks: {
			chunks: "async",
		},
	},
});
serverConfig.module.noParse = /typescript[\/\\]lib[\/\\]typescript\.js/;
serverConfig.module.rules.push({
	test: /javascriptLibs.ts$/,
	use: [
		{
			loader: path.resolve(
				__dirname,
				"build",
				"javaScriptLibraryLoader.js",
			),
		},
	],
});

module.exports = serverConfig;
