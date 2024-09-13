/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import {
	DragAndDropObserver,
	getWindow,
} from "../../../../../base/browser/dom.js";
import { isWeb } from "../../../../../base/common/platform.js";
import * as nls from "../../../../../nls.js";
import type { ILocalizedString } from "../../../../../platform/action/common/action.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { IContextKeyService } from "../../../../../platform/contextkey/common/contextkey.js";
import { IContextMenuService } from "../../../../../platform/contextview/browser/contextView.js";
import { IHoverService } from "../../../../../platform/hover/browser/hover.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { IKeybindingService } from "../../../../../platform/keybinding/common/keybinding.js";
import { ILabelService } from "../../../../../platform/label/common/label.js";
import { IOpenerService } from "../../../../../platform/opener/common/opener.js";
import { ITelemetryService } from "../../../../../platform/telemetry/common/telemetry.js";
import { listDropOverBackground } from "../../../../../platform/theme/common/colorRegistry.js";
import { IThemeService } from "../../../../../platform/theme/common/themeService.js";
import {
	IWorkspaceContextService,
	WorkbenchState,
	isTemporaryWorkspace,
} from "../../../../../platform/workspace/common/workspace.js";
import { ResourcesDropHandler } from "../../../../browser/dnd.js";
import { ViewPane } from "../../../../browser/parts/views/viewPane.js";
import type { IViewletViewOptions } from "../../../../browser/parts/views/viewsViewlet.js";
import { IViewDescriptorService } from "../../../../common/views.js";

export class EmptyView extends ViewPane {
	static readonly ID: string = "workbench.explorer.emptyView";
	static readonly NAME: ILocalizedString = nls.localize2(
		"noWorkspace",
		"No Folder Opened",
	);
	private _disposed = false;

	constructor(
		options: IViewletViewOptions,
		@IThemeService themeService: IThemeService,
		@IViewDescriptorService viewDescriptorService: IViewDescriptorService,
		@IInstantiationService instantiationService: IInstantiationService,
		@IKeybindingService keybindingService: IKeybindingService,
		@IContextMenuService contextMenuService: IContextMenuService,
		@IWorkspaceContextService private readonly contextService: IWorkspaceContextService,
		@IConfigurationService configurationService: IConfigurationService,
		@ILabelService private labelService: ILabelService,
		@IContextKeyService contextKeyService: IContextKeyService,
		@IOpenerService openerService: IOpenerService,
		@ITelemetryService telemetryService: ITelemetryService,
		@IHoverService hoverService: IHoverService,
	) {
		super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService, hoverService);

		this._register(this.contextService.onDidChangeWorkbenchState(() => this.refreshTitle()));
		this._register(this.labelService.onDidChangeFormatters(() => this.refreshTitle()));
	}

	override shouldShowWelcome(): boolean {
		return true;
	}

	protected override renderBody(container: HTMLElement): void {
		super.renderBody(container);

		this._register(
			new DragAndDropObserver(container, {
				onDrop: (e) => {
					container.style.backgroundColor = "";
					const dropHandler =
						this.instantiationService.createInstance(
							ResourcesDropHandler,
							{
								allowWorkspaceOpen:
									!isWeb ||
									isTemporaryWorkspace(
										this.contextService.getWorkspace(),
									),
							},
						);
					dropHandler.handleDrop(e, getWindow(container));
				},
				onDragEnter: () => {
					const color = this.themeService
						.getColorTheme()
						.getColor(listDropOverBackground);
					container.style.backgroundColor = color
						? color.toString()
						: "";
				},
				onDragEnd: () => {
					container.style.backgroundColor = "";
				},
				onDragLeave: () => {
					container.style.backgroundColor = "";
				},
				onDragOver: (e) => {
					if (e.dataTransfer) {
						e.dataTransfer.dropEffect = "copy";
					}
				},
			}),
		);

		this.refreshTitle();
	}

	private refreshTitle(): void {
		if (this._disposed) {
			return;
		}

		if (
			this.contextService.getWorkbenchState() === WorkbenchState.WORKSPACE
		) {
			this.updateTitle(EmptyView.NAME.value);
		} else {
			this.updateTitle(this.title);
		}
	}

	override dispose(): void {
		this._disposed = true;
		super.dispose();
	}
}
