/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import type { ScrollEvent } from "../../base/common/scrollable.js";
import type { IColorTheme } from "../../platform/theme/common/themeService.js";
import type {
	ConfigurationChangedEvent,
	EditorOption,
} from "./config/editorOptions.js";
import type { Range } from "./core/range.js";
import type { Selection } from "./core/selection.js";
import type { CursorChangeReason } from "./cursorEvents.js";
import type { ScrollType } from "./editorCommon.js";
import type { IModelDecorationsChangedEvent } from "./textModelEvents.js";

export enum ViewEventType {
	ViewCompositionStart = 0,
	ViewCompositionEnd = 1,
	ViewConfigurationChanged = 2,
	ViewCursorStateChanged = 3,
	ViewDecorationsChanged = 4,
	ViewFlushed = 5,
	ViewFocusChanged = 6,
	ViewLanguageConfigurationChanged = 7,
	ViewLineMappingChanged = 8,
	ViewLinesChanged = 9,
	ViewLinesDeleted = 10,
	ViewLinesInserted = 11,
	ViewRevealRangeRequest = 12,
	ViewScrollChanged = 13,
	ViewThemeChanged = 14,
	ViewTokensChanged = 15,
	ViewTokensColorsChanged = 16,
	ViewZonesChanged = 17,
}

export class ViewCompositionStartEvent {
	public readonly type = ViewEventType.ViewCompositionStart;
	constructor() {}
}

export class ViewCompositionEndEvent {
	public readonly type = ViewEventType.ViewCompositionEnd;
	constructor() {}
}

export class ViewConfigurationChangedEvent {
	public readonly type = ViewEventType.ViewConfigurationChanged;

	public readonly _source: ConfigurationChangedEvent;

	constructor(source: ConfigurationChangedEvent) {
		this._source = source;
	}

	public hasChanged(id: EditorOption): boolean {
		return this._source.hasChanged(id);
	}
}

export class ViewCursorStateChangedEvent {
	public readonly type = ViewEventType.ViewCursorStateChanged;

	constructor(
		public readonly selections: Selection[],
		public readonly modelSelections: Selection[],
		public readonly reason: CursorChangeReason,
	) {}
}

export class ViewDecorationsChangedEvent {
	public readonly type = ViewEventType.ViewDecorationsChanged;

	readonly affectsMinimap: boolean;
	readonly affectsOverviewRuler: boolean;
	readonly affectsGlyphMargin: boolean;
	readonly affectsLineNumber: boolean;

	constructor(source: IModelDecorationsChangedEvent | null) {
		if (source) {
			this.affectsMinimap = source.affectsMinimap;
			this.affectsOverviewRuler = source.affectsOverviewRuler;
			this.affectsGlyphMargin = source.affectsGlyphMargin;
			this.affectsLineNumber = source.affectsLineNumber;
		} else {
			this.affectsMinimap = true;
			this.affectsOverviewRuler = true;
			this.affectsGlyphMargin = true;
			this.affectsLineNumber = true;
		}
	}
}

export class ViewFlushedEvent {
	public readonly type = ViewEventType.ViewFlushed;

	constructor() {
		// Nothing to do
	}
}

export class ViewFocusChangedEvent {
	public readonly type = ViewEventType.ViewFocusChanged;

	public readonly isFocused: boolean;

	constructor(isFocused: boolean) {
		this.isFocused = isFocused;
	}
}

export class ViewLanguageConfigurationEvent {
	public readonly type = ViewEventType.ViewLanguageConfigurationChanged;
}

export class ViewLineMappingChangedEvent {
	public readonly type = ViewEventType.ViewLineMappingChanged;

	constructor() {
		// Nothing to do
	}
}

export class ViewLinesChangedEvent {
	public readonly type = ViewEventType.ViewLinesChanged;

	constructor(
		/**
		 * The first line that has changed.
		 */
		public readonly fromLineNumber: number,
		/**
		 * The number of lines that have changed.
		 */
		public readonly count: number,
	) {}
}

export class ViewLinesDeletedEvent {
	public readonly type = ViewEventType.ViewLinesDeleted;

	/**
	 * At what line the deletion began (inclusive).
	 */
	public readonly fromLineNumber: number;
	/**
	 * At what line the deletion stopped (inclusive).
	 */
	public readonly toLineNumber: number;

	constructor(fromLineNumber: number, toLineNumber: number) {
		this.fromLineNumber = fromLineNumber;
		this.toLineNumber = toLineNumber;
	}
}

export class ViewLinesInsertedEvent {
	public readonly type = ViewEventType.ViewLinesInserted;

	/**
	 * Before what line did the insertion begin
	 */
	public readonly fromLineNumber: number;
	/**
	 * `toLineNumber` - `fromLineNumber` + 1 denotes the number of lines that were inserted
	 */
	public readonly toLineNumber: number;

	constructor(fromLineNumber: number, toLineNumber: number) {
		this.fromLineNumber = fromLineNumber;
		this.toLineNumber = toLineNumber;
	}
}

export enum VerticalRevealType {
	Simple = 0,
	Center = 1,
	CenterIfOutsideViewport = 2,
	Top = 3,
	Bottom = 4,
	NearTop = 5,
	NearTopIfOutsideViewport = 6,
}

export class ViewRevealRangeRequestEvent {
	public readonly type = ViewEventType.ViewRevealRangeRequest;

	constructor(
		/**
		 * Source of the call that caused the event.
		 */
		public readonly source: string | null | undefined,
		/**
		 * Reduce the revealing to a minimum (e.g. avoid scrolling if the bounding box is visible and near the viewport edge).
		 */
		public readonly minimalReveal: boolean,
		/**
		 * Range to be reavealed.
		 */
		public readonly range: Range | null,
		/**
		 * Selections to be revealed.
		 */
		public readonly selections: Selection[] | null,
		/**
		 * The vertical reveal strategy.
		 */
		public readonly verticalType: VerticalRevealType,
		/**
		 * If true: there should be a horizontal & vertical revealing.
		 * If false: there should be just a vertical revealing.
		 */
		public readonly revealHorizontal: boolean,
		/**
		 * The scroll type.
		 */
		public readonly scrollType: ScrollType,
	) {}
}

export class ViewScrollChangedEvent {
	public readonly type = ViewEventType.ViewScrollChanged;

	public readonly scrollWidth: number;
	public readonly scrollLeft: number;
	public readonly scrollHeight: number;
	public readonly scrollTop: number;

	public readonly scrollWidthChanged: boolean;
	public readonly scrollLeftChanged: boolean;
	public readonly scrollHeightChanged: boolean;
	public readonly scrollTopChanged: boolean;

	constructor(source: ScrollEvent) {
		this.scrollWidth = source.scrollWidth;
		this.scrollLeft = source.scrollLeft;
		this.scrollHeight = source.scrollHeight;
		this.scrollTop = source.scrollTop;

		this.scrollWidthChanged = source.scrollWidthChanged;
		this.scrollLeftChanged = source.scrollLeftChanged;
		this.scrollHeightChanged = source.scrollHeightChanged;
		this.scrollTopChanged = source.scrollTopChanged;
	}
}

export class ViewThemeChangedEvent {
	public readonly type = ViewEventType.ViewThemeChanged;

	constructor(public readonly theme: IColorTheme) {}
}

export class ViewTokensChangedEvent {
	public readonly type = ViewEventType.ViewTokensChanged;

	public readonly ranges: {
		/**
		 * Start line number of range
		 */
		readonly fromLineNumber: number;
		/**
		 * End line number of range
		 */
		readonly toLineNumber: number;
	}[];

	constructor(ranges: { fromLineNumber: number; toLineNumber: number }[]) {
		this.ranges = ranges;
	}
}

export class ViewTokensColorsChangedEvent {
	public readonly type = ViewEventType.ViewTokensColorsChanged;

	constructor() {
		// Nothing to do
	}
}

export class ViewZonesChangedEvent {
	public readonly type = ViewEventType.ViewZonesChanged;

	constructor() {
		// Nothing to do
	}
}

export type ViewEvent =
	| ViewCompositionStartEvent
	| ViewCompositionEndEvent
	| ViewConfigurationChangedEvent
	| ViewCursorStateChangedEvent
	| ViewDecorationsChangedEvent
	| ViewFlushedEvent
	| ViewFocusChangedEvent
	| ViewLanguageConfigurationEvent
	| ViewLineMappingChangedEvent
	| ViewLinesChangedEvent
	| ViewLinesDeletedEvent
	| ViewLinesInsertedEvent
	| ViewRevealRangeRequestEvent
	| ViewScrollChangedEvent
	| ViewThemeChangedEvent
	| ViewTokensChangedEvent
	| ViewTokensColorsChangedEvent
	| ViewZonesChangedEvent;
