/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { reset } from "../../../../base/browser/dom.js";
import {
	ActionViewItem,
	type IBaseActionViewItemOptions,
} from "../../../../base/browser/ui/actionbar/actionViewItems.js";
import type {
	ActionBar,
	IActionViewItemProvider,
} from "../../../../base/browser/ui/actionbar/actionbar.js";
import { renderLabelWithIcons } from "../../../../base/browser/ui/iconLabel/iconLabels.js";
import { Action, type IAction } from "../../../../base/common/actions.js";
import { equals } from "../../../../base/common/arrays.js";
import type { IDisposable } from "../../../../base/common/lifecycle.js";
import {
	type IResourceNode,
	ResourceTree,
} from "../../../../base/common/resourceTree.js";
import type { Command } from "../../../../editor/common/languages.js";
import {
	createActionViewItem,
	createAndFillInActionBarActions,
	createAndFillInContextMenuActions,
} from "../../../../platform/actions/browser/menuEntryActionViewItem.js";
import {
	type IMenu,
	MenuItemAction,
} from "../../../../platform/actions/common/actions.js";
import type { ICommandService } from "../../../../platform/commands/common/commands.js";
import type { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import type {
	SCMHistoryItemLoadMoreTreeElement,
	SCMHistoryItemViewModelTreeElement,
} from "../common/history.js";
import type {
	ISCMActionButton,
	ISCMInput,
	ISCMProvider,
	ISCMRepository,
	ISCMResource,
	ISCMResourceGroup,
	ISCMViewService,
} from "../common/scm.js";

export function isSCMViewService(element: any): element is ISCMViewService {
	return (
		Array.isArray((element as ISCMViewService).repositories) &&
		Array.isArray((element as ISCMViewService).visibleRepositories)
	);
}

export function isSCMRepository(element: any): element is ISCMRepository {
	return (
		!!(element as ISCMRepository).provider &&
		!!(element as ISCMRepository).input
	);
}

export function isSCMInput(element: any): element is ISCMInput {
	return (
		!!(element as ISCMInput).validateInput &&
		typeof (element as ISCMInput).value === "string"
	);
}

export function isSCMActionButton(element: any): element is ISCMActionButton {
	return (element as ISCMActionButton).type === "actionButton";
}

export function isSCMResourceGroup(element: any): element is ISCMResourceGroup {
	return (
		!!(element as ISCMResourceGroup).provider &&
		!!(element as ISCMResourceGroup).resources
	);
}

export function isSCMResource(element: any): element is ISCMResource {
	return (
		!!(element as ISCMResource).sourceUri &&
		isSCMResourceGroup((element as ISCMResource).resourceGroup)
	);
}

export function isSCMResourceNode(
	element: any,
): element is IResourceNode<ISCMResource, ISCMResourceGroup> {
	return (
		ResourceTree.isResourceNode(element) &&
		isSCMResourceGroup(element.context)
	);
}

export function isSCMHistoryItemViewModelTreeElement(
	element: any,
): element is SCMHistoryItemViewModelTreeElement {
	return (
		(element as SCMHistoryItemViewModelTreeElement).type ===
		"historyItemViewModel"
	);
}

export function isSCMHistoryItemLoadMoreTreeElement(
	element: any,
): element is SCMHistoryItemLoadMoreTreeElement {
	return (
		(element as SCMHistoryItemLoadMoreTreeElement).type ===
		"historyItemLoadMore"
	);
}

const compareActions = (a: IAction, b: IAction) => {
	if (a instanceof MenuItemAction && b instanceof MenuItemAction) {
		return (
			a.id === b.id &&
			a.enabled === b.enabled &&
			a.hideActions?.isHidden === b.hideActions?.isHidden
		);
	}

	return a.id === b.id && a.enabled === b.enabled;
};

export function connectPrimaryMenu(
	menu: IMenu,
	callback: (primary: IAction[], secondary: IAction[]) => void,
	primaryGroup?: string,
): IDisposable {
	let cachedPrimary: IAction[] = [];
	let cachedSecondary: IAction[] = [];

	const updateActions = () => {
		const primary: IAction[] = [];
		const secondary: IAction[] = [];

		createAndFillInActionBarActions(
			menu,
			{ shouldForwardArgs: true },
			{ primary, secondary },
			primaryGroup,
		);

		if (
			equals(cachedPrimary, primary, compareActions) &&
			equals(cachedSecondary, secondary, compareActions)
		) {
			return;
		}

		cachedPrimary = primary;
		cachedSecondary = secondary;

		callback(primary, secondary);
	};

	updateActions();

	return menu.onDidChange(updateActions);
}

export function connectPrimaryMenuToInlineActionBar(
	menu: IMenu,
	actionBar: ActionBar,
): IDisposable {
	return connectPrimaryMenu(
		menu,
		(primary) => {
			actionBar.clear();
			actionBar.push(primary, { icon: true, label: false });
		},
		"inline",
	);
}

export function collectContextMenuActions(menu: IMenu): IAction[] {
	const primary: IAction[] = [];
	const actions: IAction[] = [];
	createAndFillInContextMenuActions(
		menu,
		{ shouldForwardArgs: true },
		{ primary, secondary: actions },
		"inline",
	);
	return actions;
}

export class StatusBarAction extends Action {
	constructor(
		private command: Command,
		private commandService: ICommandService,
	) {
		super(`statusbaraction{${command.id}}`, command.title, "", true);
		this.tooltip = command.tooltip || "";
	}

	override run(): Promise<void> {
		return this.commandService.executeCommand(
			this.command.id,
			...(this.command.arguments || []),
		);
	}
}

class StatusBarActionViewItem extends ActionViewItem {
	constructor(action: StatusBarAction, options: IBaseActionViewItemOptions) {
		super(null, action, { ...options, icon: false, label: true });
	}

	protected override updateLabel(): void {
		if (this.options.label && this.label) {
			reset(this.label, ...renderLabelWithIcons(this.action.label));
		}
	}
}

export function getActionViewItemProvider(
	instaService: IInstantiationService,
): IActionViewItemProvider {
	return (action, options) => {
		if (action instanceof StatusBarAction) {
			return new StatusBarActionViewItem(action, options);
		}

		return createActionViewItem(instaService, action, options);
	};
}

export function getProviderKey(provider: ISCMProvider): string {
	return `${provider.contextValue}:${provider.label}${provider.rootUri ? `:${provider.rootUri.toString()}` : ""}`;
}

export function getRepositoryResourceCount(provider: ISCMProvider): number {
	return provider.groups.reduce<number>((r, g) => r + g.resources.length, 0);
}
