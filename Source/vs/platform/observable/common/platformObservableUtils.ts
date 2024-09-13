/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import type { IDisposable } from "../../../base/common/lifecycle.js";
import {
	type IObservable,
	type IReader,
	autorunOpts,
	observableFromEventOpts,
} from "../../../base/common/observable.js";
import type { IConfigurationService } from "../../configuration/common/configuration.js";
import type {
	ContextKeyValue,
	IContextKeyService,
	RawContextKey,
} from "../../contextkey/common/contextkey.js";

/** Creates an observable update when a configuration key updates. */
export function observableConfigValue<T>(
	key: string,
	defaultValue: T,
	configurationService: IConfigurationService,
): IObservable<T> {
	return observableFromEventOpts(
		{ debugName: () => `Configuration Key "${key}"` },
		(handleChange) =>
			configurationService.onDidChangeConfiguration((e) => {
				if (e.affectsConfiguration(key)) {
					handleChange(e);
				}
			}),
		() => configurationService.getValue<T>(key) ?? defaultValue,
	);
}

/** Update the configuration key with a value derived from observables. */
export function bindContextKey<T extends ContextKeyValue>(
	key: RawContextKey<T>,
	service: IContextKeyService,
	computeValue: (reader: IReader) => T,
): IDisposable {
	const boundKey = key.bindTo(service);
	return autorunOpts(
		{ debugName: () => `Set Context Key "${key.key}"` },
		(reader) => {
			boundKey.set(computeValue(reader));
		},
	);
}
