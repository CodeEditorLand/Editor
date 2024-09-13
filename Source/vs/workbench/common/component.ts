/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import type { Event } from "../../base/common/event.js";
import type { DisposableStore } from "../../base/common/lifecycle.js";
import type {
	IStorageService,
	IStorageValueChangeEvent,
	StorageScope,
	StorageTarget,
} from "../../platform/storage/common/storage.js";
import {
	type IThemeService,
	Themable,
} from "../../platform/theme/common/themeService.js";
import { Memento, type MementoObject } from "./memento.js";

export class Component extends Themable {
	private readonly memento: Memento;

	constructor(
		private readonly id: string,
		themeService: IThemeService,
		storageService: IStorageService,
	) {
		super(themeService);

		this.memento = new Memento(this.id, storageService);

		this._register(
			storageService.onWillSaveState(() => {
				// Ask the component to persist state into the memento
				this.saveState();

				// Then save the memento into storage
				this.memento.saveMemento();
			}),
		);
	}

	getId(): string {
		return this.id;
	}

	protected getMemento(
		scope: StorageScope,
		target: StorageTarget,
	): MementoObject {
		return this.memento.getMemento(scope, target);
	}

	protected reloadMemento(scope: StorageScope): void {
		return this.memento.reloadMemento(scope);
	}

	protected onDidChangeMementoValue(
		scope: StorageScope,
		disposables: DisposableStore,
	): Event<IStorageValueChangeEvent> {
		return this.memento.onDidChangeValue(scope, disposables);
	}

	protected saveState(): void {
		// Subclasses to implement for storing state
	}
}
