/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Event } from "../../../../base/common/event.js";
import { KeyCode, KeyMod } from "../../../../base/common/keyCodes.js";
import { KeybindingWeight } from "../../../../platform/keybinding/common/keybindingsRegistry.js";
import {
	Extensions,
	IQuickAccessRegistry,
} from "../../../../platform/quickinput/common/quickAccess.js";
import { IQuickInputService } from "../../../../platform/quickinput/common/quickInput.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import {
	EditorAction,
	registerEditorAction,
	ServicesAccessor,
} from "../../../browser/editorExtensions.js";
import { ICodeEditorService } from "../../../browser/services/codeEditorService.js";
import { EditorContextKeys } from "../../../common/editorContextKeys.js";
import { GoToLineNLS } from "../../../common/standaloneStrings.js";
import { AbstractGotoLineQuickAccessProvider } from "../../../contrib/quickAccess/browser/gotoLineQuickAccess.js";

export class StandaloneGotoLineQuickAccessProvider extends AbstractGotoLineQuickAccessProvider {
	protected readonly onDidActiveTextEditorControlChange = Event.None;

	constructor(
		@ICodeEditorService private readonly editorService: ICodeEditorService,
	) {
		super();
	}

	protected get activeTextEditorControl() {
		return this.editorService.getFocusedCodeEditor() ?? undefined;
	}
}

export class GotoLineAction extends EditorAction {
	static readonly ID = "editor.action.gotoLine";

	constructor() {
		super({
			id: GotoLineAction.ID,
			label: GoToLineNLS.gotoLineActionLabel,
			alias: "Go to Line/Column...",
			precondition: undefined,
			kbOpts: {
				kbExpr: EditorContextKeys.focus,
				primary: KeyMod.CtrlCmd | KeyCode.KeyG,
				mac: { primary: KeyMod.WinCtrl | KeyCode.KeyG },
				weight: KeybindingWeight.EditorContrib,
			},
		});
	}

	run(accessor: ServicesAccessor): void {
		accessor
			.get(IQuickInputService)
			.quickAccess.show(StandaloneGotoLineQuickAccessProvider.PREFIX);
	}
}

registerEditorAction(GotoLineAction);

Registry.as<IQuickAccessRegistry>(
	Extensions.Quickaccess,
).registerQuickAccessProvider({
	ctor: StandaloneGotoLineQuickAccessProvider,
	prefix: StandaloneGotoLineQuickAccessProvider.PREFIX,
	helpEntries: [
		{
			description: GoToLineNLS.gotoLineActionLabel,
			commandId: GotoLineAction.ID,
		},
	],
});
