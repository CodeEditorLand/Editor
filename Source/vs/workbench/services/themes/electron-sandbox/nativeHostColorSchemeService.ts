/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Emitter } from "../../../../base/common/event.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { isBoolean, isObject } from "../../../../base/common/types.js";
import {
	InstantiationType,
	registerSingleton,
} from "../../../../platform/instantiation/common/extensions.js";
import { INativeHostService } from "../../../../platform/native/common/native.js";
import {
	IStorageService,
	StorageScope,
	StorageTarget,
} from "../../../../platform/storage/common/storage.js";
import type { IColorScheme } from "../../../../platform/window/common/window.js";
import { INativeWorkbenchEnvironmentService } from "../../environment/electron-sandbox/environmentService.js";
import { IHostColorSchemeService } from "../common/hostColorSchemeService.js";

export class NativeHostColorSchemeService
	extends Disposable
	implements IHostColorSchemeService
{
	static readonly STORAGE_KEY = "HostColorSchemeData";

	declare readonly _serviceBrand: undefined;

	private readonly _onDidChangeColorScheme = this._register(
		new Emitter<void>(),
	);
	readonly onDidChangeColorScheme = this._onDidChangeColorScheme.event;

	public dark: boolean;
	public highContrast: boolean;

	constructor(
		@INativeHostService private readonly nativeHostService: INativeHostService,
		@INativeWorkbenchEnvironmentService environmentService: INativeWorkbenchEnvironmentService,
		@IStorageService private storageService: IStorageService
	) {
		super();

		// register listener with the OS
		this._register(this.nativeHostService.onDidChangeColorScheme(scheme => this.update(scheme)));

		const initial = this.getStoredValue() ?? environmentService.window.colorScheme;
		this.dark = initial.dark;
		this.highContrast = initial.highContrast;

		// fetch the actual value from the OS
		this.nativeHostService.getOSColorScheme().then(scheme => this.update(scheme));
	}

	private getStoredValue(): IColorScheme | undefined {
		const stored = this.storageService.get(
			NativeHostColorSchemeService.STORAGE_KEY,
			StorageScope.APPLICATION,
		);
		if (stored) {
			try {
				const scheme = JSON.parse(stored);
				if (
					isObject(scheme) &&
					isBoolean(scheme.highContrast) &&
					isBoolean(scheme.dark)
				) {
					return scheme as IColorScheme;
				}
			} catch (e) {
				// ignore
			}
		}
		return undefined;
	}

	private update({ highContrast, dark }: IColorScheme) {
		if (dark !== this.dark || highContrast !== this.highContrast) {
			this.dark = dark;
			this.highContrast = highContrast;
			this.storageService.store(
				NativeHostColorSchemeService.STORAGE_KEY,
				JSON.stringify({ highContrast, dark }),
				StorageScope.APPLICATION,
				StorageTarget.MACHINE,
			);
			this._onDidChangeColorScheme.fire();
		}
	}
}

registerSingleton(
	IHostColorSchemeService,
	NativeHostColorSchemeService,
	InstantiationType.Delayed,
);
