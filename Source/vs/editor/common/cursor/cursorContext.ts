/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import type {
	CursorConfiguration,
	ICursorSimpleModel,
} from "../cursorCommon.js";
import type { ITextModel } from "../model.js";
import type { ICoordinatesConverter } from "../viewModel.js";

export class CursorContext {
	_cursorContextBrand: void = undefined;

	public readonly model: ITextModel;
	public readonly viewModel: ICursorSimpleModel;
	public readonly coordinatesConverter: ICoordinatesConverter;
	public readonly cursorConfig: CursorConfiguration;

	constructor(
		model: ITextModel,
		viewModel: ICursorSimpleModel,
		coordinatesConverter: ICoordinatesConverter,
		cursorConfig: CursorConfiguration,
	) {
		this.model = model;
		this.viewModel = viewModel;
		this.coordinatesConverter = coordinatesConverter;
		this.cursorConfig = cursorConfig;
	}
}
