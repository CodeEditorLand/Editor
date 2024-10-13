/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { KeyCode } from "../../../../base/common/keyCodes.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { IDialogService } from "../../../../platform/dialogs/common/dialogs.js";
import {
	IInstantiationService,
	ServicesAccessor,
} from "../../../../platform/instantiation/common/instantiation.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { KeybindingWeight } from "../../../../platform/keybinding/common/keybindingsRegistry.js";
import { ICommandQuickPick } from "../../../../platform/quickinput/browser/commandsQuickAccess.js";
import {
	Extensions,
	IQuickAccessRegistry,
} from "../../../../platform/quickinput/common/quickAccess.js";
import { IQuickInputService } from "../../../../platform/quickinput/common/quickInput.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import {
	EditorAction,
	registerEditorAction,
} from "../../../browser/editorExtensions.js";
import { ICodeEditorService } from "../../../browser/services/codeEditorService.js";
import { IEditor } from "../../../common/editorCommon.js";
import { EditorContextKeys } from "../../../common/editorContextKeys.js";
import { QuickCommandNLS } from "../../../common/standaloneStrings.js";
import { AbstractEditorCommandsQuickAccessProvider } from "../../../contrib/quickAccess/browser/commandsQuickAccess.js";

export class StandaloneCommandsQuickAccessProvider extends AbstractEditorCommandsQuickAccessProvider {
	protected get activeTextEditorControl(): IEditor | undefined {
		return this.codeEditorService.getFocusedCodeEditor() ?? undefined;
	}

	constructor(
		@IInstantiationService instantiationService: IInstantiationService,
		@ICodeEditorService
		private readonly codeEditorService: ICodeEditorService,
		@IKeybindingService keybindingService: IKeybindingService,
		@ICommandService commandService: ICommandService,
		@ITelemetryService telemetryService: ITelemetryService,
		@IDialogService dialogService: IDialogService,
	) {
		super(
			{ showAlias: false },
			instantiationService,
			keybindingService,
			commandService,
			telemetryService,
			dialogService,
		);
	}

	protected async getCommandPicks(): Promise<Array<ICommandQuickPick>> {
		return this.getCodeEditorCommandPicks();
	}

	protected hasAdditionalCommandPicks(): boolean {
		return false;
	}

	protected async getAdditionalCommandPicks(): Promise<ICommandQuickPick[]> {
		return [];
	}
}

export class GotoLineAction extends EditorAction {
	static readonly ID = "editor.action.quickCommand";

	constructor() {
		super({
			id: GotoLineAction.ID,
			label: QuickCommandNLS.quickCommandActionLabel,
			alias: "Command Palette",
			precondition: undefined,
			kbOpts: {
				kbExpr: EditorContextKeys.focus,
				primary: KeyCode.F1,
				weight: KeybindingWeight.EditorContrib,
			},
			contextMenuOpts: {
				group: "z_commands",
				order: 1,
			},
		});
	}

	run(accessor: ServicesAccessor): void {
		accessor
			.get(IQuickInputService)
			.quickAccess.show(StandaloneCommandsQuickAccessProvider.PREFIX);
	}
}

registerEditorAction(GotoLineAction);

Registry.as<IQuickAccessRegistry>(
	Extensions.Quickaccess,
).registerQuickAccessProvider({
	ctor: StandaloneCommandsQuickAccessProvider,
	prefix: StandaloneCommandsQuickAccessProvider.PREFIX,
	helpEntries: [
		{
			description: QuickCommandNLS.quickCommandHelp,
			commandId: GotoLineAction.ID,
		},
	],
});
