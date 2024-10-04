/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { ViewEventHandler } from "../../common/viewEventHandler.js";
import { RenderingContext } from "./renderingContext.js";

export abstract class DynamicViewOverlay extends ViewEventHandler {
	public abstract prepareRender(ctx: RenderingContext): void;

	public abstract render(startLineNumber: number, lineNumber: number): string;
}
