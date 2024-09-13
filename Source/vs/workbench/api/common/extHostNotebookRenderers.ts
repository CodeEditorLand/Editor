/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import type * as vscode from "vscode";
import { Emitter } from "../../../base/common/event.js";
import type { IExtensionDescription } from "../../../platform/extensions/common/extensions.js";
import {
	type ExtHostNotebookRenderersShape,
	type IMainContext,
	MainContext,
	type MainThreadNotebookRenderersShape,
} from "./extHost.protocol.js";
import type { ExtHostNotebookController } from "./extHostNotebook.js";
import { ExtHostNotebookEditor } from "./extHostNotebookEditor.js";

export class ExtHostNotebookRenderers implements ExtHostNotebookRenderersShape {
	private readonly _rendererMessageEmitters = new Map<
		string /* rendererId */,
		Emitter<{ editor: vscode.NotebookEditor; message: any }>
	>();
	private readonly proxy: MainThreadNotebookRenderersShape;

	constructor(
		mainContext: IMainContext,
		private readonly _extHostNotebook: ExtHostNotebookController,
	) {
		this.proxy = mainContext.getProxy(
			MainContext.MainThreadNotebookRenderers,
		);
	}

	public $postRendererMessage(
		editorId: string,
		rendererId: string,
		message: unknown,
	): void {
		const editor = this._extHostNotebook.getEditorById(editorId);
		this._rendererMessageEmitters
			.get(rendererId)
			?.fire({ editor: editor.apiEditor, message });
	}

	public createRendererMessaging(
		manifest: IExtensionDescription,
		rendererId: string,
	): vscode.NotebookRendererMessaging {
		if (
			!manifest.contributes?.notebookRenderer?.some(
				(r) => r.id === rendererId,
			)
		) {
			throw new Error(
				`Extensions may only call createRendererMessaging() for renderers they contribute (got ${rendererId})`,
			);
		}

		const messaging: vscode.NotebookRendererMessaging = {
			onDidReceiveMessage: (listener, thisArg, disposables) => {
				return this.getOrCreateEmitterFor(rendererId).event(
					listener,
					thisArg,
					disposables,
				);
			},
			postMessage: (message, editorOrAlias) => {
				if (ExtHostNotebookEditor.apiEditorsToExtHost.has(message)) {
					// back compat for swapped args
					[message, editorOrAlias] = [editorOrAlias, message];
				}

				const extHostEditor =
					editorOrAlias &&
					ExtHostNotebookEditor.apiEditorsToExtHost.get(
						editorOrAlias,
					);
				return this.proxy.$postMessage(
					extHostEditor?.id,
					rendererId,
					message,
				);
			},
		};

		return messaging;
	}

	private getOrCreateEmitterFor(rendererId: string) {
		let emitter = this._rendererMessageEmitters.get(rendererId);
		if (emitter) {
			return emitter;
		}

		emitter = new Emitter({
			onDidRemoveLastListener: () => {
				emitter?.dispose();
				this._rendererMessageEmitters.delete(rendererId);
			},
		});

		this._rendererMessageEmitters.set(rendererId, emitter);

		return emitter;
	}
}
