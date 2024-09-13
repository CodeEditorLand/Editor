/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import {
	Disposable,
	type IDisposable,
} from "../../../../../../base/common/lifecycle.js";
import type { URI } from "../../../../../../base/common/uri.js";
import * as nls from "../../../../../../nls.js";
import {
	type IConfigurationChangeEvent,
	IConfigurationService,
} from "../../../../../../platform/configuration/common/configuration.js";
import {
	type IContextKey,
	IContextKeyService,
} from "../../../../../../platform/contextkey/common/contextkey.js";
import { SyncDescriptor } from "../../../../../../platform/instantiation/common/descriptors.js";
import { Registry } from "../../../../../../platform/registry/common/platform.js";
import type { IWorkbenchContribution } from "../../../../../common/contributions.js";
import {
	Extensions,
	type IViewContainersRegistry,
	type IViewsRegistry,
} from "../../../../../common/views.js";
import { IEditorService } from "../../../../../services/editor/common/editorService.js";
import { VIEWLET_ID as debugContainerId } from "../../../../debug/common/debug.js";
import { NotebookSetting } from "../../../common/notebookCommon.js";
import { INotebookExecutionStateService } from "../../../common/notebookExecutionStateService.js";
import { INotebookKernelService } from "../../../common/notebookKernelService.js";
import { INotebookService } from "../../../common/notebookService.js";
import { getNotebookEditorFromEditorPane } from "../../notebookBrowser.js";
import { variablesViewIcon } from "../../notebookIcons.js";
import { NOTEBOOK_VARIABLE_VIEW_ENABLED } from "./notebookVariableContextKeys.js";
import { NotebookVariablesView } from "./notebookVariablesView.js";

export class NotebookVariables
	extends Disposable
	implements IWorkbenchContribution
{
	private listeners: IDisposable[] = [];
	private configListener: IDisposable;
	private initialized = false;

	private viewEnabled: IContextKey<boolean>;

	constructor(
		@IContextKeyService contextKeyService: IContextKeyService,
		@IConfigurationService private readonly configurationService: IConfigurationService,
		@IEditorService private readonly editorService: IEditorService,
		@INotebookExecutionStateService private readonly notebookExecutionStateService: INotebookExecutionStateService,
		@INotebookKernelService private readonly notebookKernelService: INotebookKernelService,
		@INotebookService private readonly notebookDocumentService: INotebookService
	) {
		super();

		this.viewEnabled = NOTEBOOK_VARIABLE_VIEW_ENABLED.bindTo(contextKeyService);

		this.listeners.push(this.editorService.onDidActiveEditorChange(() => this.handleInitEvent()));
		this.listeners.push(this.notebookExecutionStateService.onDidChangeExecution((e) => this.handleInitEvent(e.notebook)));

		this.configListener = configurationService.onDidChangeConfiguration((e) => this.handleConfigChange(e));
	}

	private handleConfigChange(e: IConfigurationChangeEvent) {
		if (e.affectsConfiguration(NotebookSetting.notebookVariablesView)) {
			if (
				!this.configurationService.getValue(
					NotebookSetting.notebookVariablesView,
				)
			) {
				this.viewEnabled.set(false);
			} else if (this.initialized) {
				this.viewEnabled.set(true);
			} else {
				this.handleInitEvent();
			}
		}
	}

	private handleInitEvent(notebook?: URI) {
		if (
			this.configurationService.getValue(
				NotebookSetting.notebookVariablesView,
			) &&
			(!!notebook ||
				this.editorService.activeEditorPane?.getId() ===
					"workbench.editor.notebook")
		) {
			if (
				this.hasVariableProvider(notebook) &&
				!this.initialized &&
				this.initializeView()
			) {
				this.viewEnabled.set(true);
				this.initialized = true;
				this.listeners.forEach((listener) => listener.dispose());
			}
		}
	}

	private hasVariableProvider(notebookUri?: URI) {
		const notebook = notebookUri
			? this.notebookDocumentService.getNotebookTextModel(notebookUri)
			: getNotebookEditorFromEditorPane(
					this.editorService.activeEditorPane,
				)?.getViewModel()?.notebookDocument;
		return (
			notebook &&
			this.notebookKernelService.getMatchingKernel(notebook).selected
				?.hasVariableProvider
		);
	}

	private initializeView() {
		const debugViewContainer = Registry.as<IViewContainersRegistry>(
			"workbench.registry.view.containers",
		).get(debugContainerId);

		if (debugViewContainer) {
			const viewsRegistry = Registry.as<IViewsRegistry>(
				Extensions.ViewsRegistry,
			);
			const viewDescriptor = {
				id: "NOTEBOOK_VARIABLES",
				name: nls.localize2("notebookVariables", "Notebook Variables"),
				containerIcon: variablesViewIcon,
				ctorDescriptor: new SyncDescriptor(NotebookVariablesView),
				order: 50,
				weight: 5,
				canToggleVisibility: true,
				canMoveView: true,
				collapsed: true,
				when: NOTEBOOK_VARIABLE_VIEW_ENABLED,
			};

			viewsRegistry.registerViews([viewDescriptor], debugViewContainer);
			return true;
		}

		return false;
	}

	override dispose(): void {
		super.dispose();
		this.listeners.forEach((listener) => listener.dispose());
		this.configListener.dispose();
	}
}
