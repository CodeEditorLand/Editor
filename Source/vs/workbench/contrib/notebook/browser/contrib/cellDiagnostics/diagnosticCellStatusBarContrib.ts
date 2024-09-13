/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Disposable } from "../../../../../../base/common/lifecycle.js";
import { autorun } from "../../../../../../base/common/observable.js";
import { localize } from "../../../../../../nls.js";
import { IInstantiationService } from "../../../../../../platform/instantiation/common/instantiation.js";
import { IKeybindingService } from "../../../../../../platform/keybinding/common/keybinding.js";
import {
	CellStatusbarAlignment,
	type INotebookCellStatusBarItem,
} from "../../../common/notebookCommon.js";
import type { ICellExecutionError } from "../../../common/notebookExecutionStateService.js";
import type {
	INotebookEditor,
	INotebookEditorContribution,
	INotebookViewModel,
} from "../../notebookBrowser.js";
import { registerNotebookContribution } from "../../notebookEditorExtensions.js";
import { CodeCellViewModel } from "../../viewModel/codeCellViewModel.js";
import { NotebookStatusBarController } from "../cellStatusBar/executionStatusBarItemController.js";
import { OPEN_CELL_FAILURE_ACTIONS_COMMAND_ID } from "./cellDiagnosticsActions.js";

export class DiagnosticCellStatusBarContrib
	extends Disposable
	implements INotebookEditorContribution
{
	static id = "workbench.notebook.statusBar.diagtnostic";

	constructor(
		notebookEditor: INotebookEditor,
		@IInstantiationService instantiationService: IInstantiationService,
	) {
		super();
		this._register(
			new NotebookStatusBarController(notebookEditor, (vm, cell) =>
				cell instanceof CodeCellViewModel
					? instantiationService.createInstance(
							DiagnosticCellStatusBarItem,
							vm,
							cell,
						)
					: Disposable.None,
			),
		);
	}
}
registerNotebookContribution(
	DiagnosticCellStatusBarContrib.id,
	DiagnosticCellStatusBarContrib,
);

class DiagnosticCellStatusBarItem extends Disposable {
	private _currentItemIds: string[] = [];

	constructor(
		private readonly _notebookViewModel: INotebookViewModel,
		private readonly cell: CodeCellViewModel,
		@IKeybindingService private readonly keybindingService: IKeybindingService,
	) {
		super();
		this._register(autorun((reader) => this.updateSparkleItem(reader.readObservable(cell.excecutionError))));

	}

	private async updateSparkleItem(error: ICellExecutionError | undefined) {
		let item: INotebookCellStatusBarItem | undefined;

		if (error?.location) {
			const keybinding = this.keybindingService
				.lookupKeybinding(OPEN_CELL_FAILURE_ACTIONS_COMMAND_ID)
				?.getLabel();
			const tooltip = localize(
				"notebook.cell.status.diagnostic",
				"Quick Actions {0}",
				`(${keybinding})`,
			);

			item = {
				text: `$(sparkle)`,
				tooltip,
				alignment: CellStatusbarAlignment.Left,
				command: OPEN_CELL_FAILURE_ACTIONS_COMMAND_ID,
				priority: Number.MAX_SAFE_INTEGER - 1,
			};
		}

		const items = item ? [item] : [];
		this._currentItemIds = this._notebookViewModel.deltaCellStatusBarItems(
			this._currentItemIds,
			[{ handle: this.cell.handle, items }],
		);
	}

	override dispose() {
		super.dispose();
		this._notebookViewModel.deltaCellStatusBarItems(this._currentItemIds, [
			{ handle: this.cell.handle, items: [] },
		]);
	}
}
