/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { StopWatch } from "../../../../base/common/stopwatch.js";
import * as nls from "../../../../nls.js";
import type { ICodeEditor } from "../../../browser/editorBrowser.js";
import {
	EditorAction,
	type ServicesAccessor,
	registerEditorAction,
} from "../../../browser/editorExtensions.js";

class ForceRetokenizeAction extends EditorAction {
	constructor() {
		super({
			id: "editor.action.forceRetokenize",
			label: nls.localize(
				"forceRetokenize",
				"Developer: Force Retokenize",
			),
			alias: "Developer: Force Retokenize",
			precondition: undefined,
		});
	}

	public run(accessor: ServicesAccessor, editor: ICodeEditor): void {
		if (!editor.hasModel()) {
			return;
		}
		const model = editor.getModel();
		model.tokenization.resetTokenization();
		const sw = new StopWatch();
		model.tokenization.forceTokenization(model.getLineCount());
		sw.stop();
		console.log(`tokenization took ${sw.elapsed()}`);
	}
}

registerEditorAction(ForceRetokenizeAction);
