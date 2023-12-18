/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { KeyCode } from "vs/base/common/keyCodes";
import {
	EditorAction,
	registerEditorAction,
} from "vs/editor/browser/editorExtensions";
import { ICodeEditorService } from "vs/editor/browser/services/codeEditorService";
import { IEditor } from "vs/editor/common/editorCommon";
import { EditorContextKeys } from "vs/editor/common/editorContextKeys";
import { QuickCommandNLS } from "vs/editor/common/standaloneStrings";
import { AbstractEditorCommandsQuickAccessProvider } from "vs/editor/contrib/quickAccess/browser/commandsQuickAccess";
import { ICommandService } from "vs/platform/commands/common/commands";
import { IDialogService } from "vs/platform/dialogs/common/dialogs";
import {
	IInstantiationService,
	ServicesAccessor,
} from "vs/platform/instantiation/common/instantiation";
import { IKeybindingService } from "vs/platform/keybinding/common/keybinding";
import { KeybindingWeight } from "vs/platform/keybinding/common/keybindingsRegistry";
import { ICommandQuickPick } from "vs/platform/quickinput/browser/commandsQuickAccess";
import {
	Extensions,
	IQuickAccessRegistry,
} from "vs/platform/quickinput/common/quickAccess";
import { IQuickInputService } from "vs/platform/quickinput/common/quickInput";
import { Registry } from "vs/platform/registry/common/platform";
import { ITelemetryService } from "vs/platform/telemetry/common/telemetry";

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
		@IDialogService dialogService: IDialogService
	) {
		super(
			{ showAlias: false },
			instantiationService,
			keybindingService,
			commandService,
			telemetryService,
			dialogService
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
