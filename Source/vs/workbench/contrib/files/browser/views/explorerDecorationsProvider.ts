/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { toErrorMessage } from "../../../../../base/common/errorMessage.js";
import { Emitter, type Event } from "../../../../../base/common/event.js";
import { DisposableStore } from "../../../../../base/common/lifecycle.js";
import type { URI } from "../../../../../base/common/uri.js";
import { localize } from "../../../../../nls.js";
import {
	listDeemphasizedForeground,
	listInvalidItemForeground,
} from "../../../../../platform/theme/common/colorRegistry.js";
import { IWorkspaceContextService } from "../../../../../platform/workspace/common/workspace.js";
import type {
	IDecorationData,
	IDecorationsProvider,
} from "../../../../services/decorations/common/decorations.js";
import type { ExplorerItem } from "../../common/explorerModel.js";
import { IExplorerService } from "../files.js";
import { explorerRootErrorEmitter } from "./explorerViewer.js";

export function provideDecorations(
	fileStat: ExplorerItem,
): IDecorationData | undefined {
	if (fileStat.isRoot && fileStat.error) {
		return {
			tooltip: localize(
				"canNotResolve",
				"Unable to resolve workspace folder ({0})",
				toErrorMessage(fileStat.error),
			),
			letter: "!",
			color: listInvalidItemForeground,
		};
	}
	if (fileStat.isSymbolicLink) {
		return {
			tooltip: localize("symbolicLlink", "Symbolic Link"),
			letter: "\u2937",
		};
	}
	if (fileStat.isUnknown) {
		return {
			tooltip: localize("unknown", "Unknown File Type"),
			letter: "?",
		};
	}
	if (fileStat.isExcluded) {
		return {
			color: listDeemphasizedForeground,
		};
	}

	return undefined;
}

export class ExplorerDecorationsProvider implements IDecorationsProvider {
	readonly label: string = localize("label", "Explorer");
	private readonly _onDidChange = new Emitter<URI[]>();
	private readonly toDispose = new DisposableStore();

	constructor(
		@IExplorerService private explorerService: IExplorerService,
		@IWorkspaceContextService contextService: IWorkspaceContextService
	) {
		this.toDispose.add(this._onDidChange);
		this.toDispose.add(contextService.onDidChangeWorkspaceFolders(e => {
			this._onDidChange.fire(e.changed.concat(e.added).map(wf => wf.uri));
		}));
		this.toDispose.add(explorerRootErrorEmitter.event((resource => {
			this._onDidChange.fire([resource]);
		})));
	}

	get onDidChange(): Event<URI[]> {
		return this._onDidChange.event;
	}

	async provideDecorations(
		resource: URI,
	): Promise<IDecorationData | undefined> {
		const fileStat = this.explorerService.findClosest(resource);
		if (!fileStat) {
			throw new Error("ExplorerItem not found");
		}

		return provideDecorations(fileStat);
	}

	dispose(): void {
		this.toDispose.dispose();
	}
}
