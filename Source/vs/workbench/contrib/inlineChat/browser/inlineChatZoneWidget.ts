/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import {
	Dimension,
	addDisposableListener,
} from "../../../../base/browser/dom.js";
import * as aria from "../../../../base/browser/ui/aria/aria.js";
import {
	MutableDisposable,
	toDisposable,
} from "../../../../base/common/lifecycle.js";
import { isEqual } from "../../../../base/common/resources.js";
import { assertType } from "../../../../base/common/types.js";
import type { ICodeEditor } from "../../../../editor/browser/editorBrowser.js";
import { StableEditorBottomScrollState } from "../../../../editor/browser/stableEditorScroll.js";
import {
	type EditorLayoutInfo,
	EditorOption,
} from "../../../../editor/common/config/editorOptions.js";
import type { Position } from "../../../../editor/common/core/position.js";
import type { Range } from "../../../../editor/common/core/range.js";
import { ScrollType } from "../../../../editor/common/editorCommon.js";
import { ZoneWidget } from "../../../../editor/contrib/zoneWidget/browser/zoneWidget.js";
import { localize } from "../../../../nls.js";
import { MenuId } from "../../../../platform/actions/common/actions.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import {
	type IContextKey,
	IContextKeyService,
} from "../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import type { IChatWidgetLocationOptions } from "../../chat/browser/chatWidget.js";
import { isResponseVM } from "../../chat/common/chatViewModel.js";
import {
	ACTION_REGENERATE_RESPONSE,
	ACTION_REPORT_ISSUE,
	ACTION_TOGGLE_DIFF,
	CTX_INLINE_CHAT_OUTER_CURSOR_POSITION,
	EditMode,
	InlineChatConfigKeys,
	MENU_INLINE_CHAT_WIDGET_SECONDARY,
	MENU_INLINE_CHAT_WIDGET_STATUS,
} from "../common/inlineChat.js";
import { EditorBasedInlineChatWidget } from "./inlineChatWidget.js";

export class InlineChatZoneWidget extends ZoneWidget {
	readonly widget: EditorBasedInlineChatWidget;

	private readonly _scrollUp = this._disposables.add(
		new ScrollUpState(this.editor),
	);
	private readonly _ctxCursorPosition: IContextKey<"above" | "below" | "">;
	private _dimension?: Dimension;

	constructor(
		location: IChatWidgetLocationOptions,
		editor: ICodeEditor,
		@IInstantiationService private readonly _instaService: IInstantiationService,
		@ILogService private _logService: ILogService,
		@IContextKeyService contextKeyService: IContextKeyService,
		@IConfigurationService configurationService: IConfigurationService,
	) {
		super(editor, { showFrame: false, showArrow: false, isAccessible: true, className: 'inline-chat-widget', keepEditorSelection: true, showInHiddenAreas: true, ordinal: 50000 });

		this._ctxCursorPosition = CTX_INLINE_CHAT_OUTER_CURSOR_POSITION.bindTo(contextKeyService);

		this._disposables.add(toDisposable(() => {
			this._ctxCursorPosition.reset();
		}));

		this.widget = this._instaService.createInstance(EditorBasedInlineChatWidget, location, this.editor, {
			statusMenuId: {
				menu: MENU_INLINE_CHAT_WIDGET_STATUS,
				options: {
					buttonConfigProvider: (action, index) => {
						const isSecondary = index > 0;
						if (new Set([ACTION_REGENERATE_RESPONSE, ACTION_TOGGLE_DIFF, ACTION_REPORT_ISSUE]).has(action.id)) {
							return { isSecondary, showIcon: true, showLabel: false };
						} else {
							return { isSecondary };
						}
					}
				}
			},
			secondaryMenuId: MENU_INLINE_CHAT_WIDGET_SECONDARY,
			chatWidgetViewOptions: {
				menus: {
					executeToolbar: MenuId.ChatExecute,
					telemetrySource: 'interactiveEditorWidget-toolbar',
				},
				rendererOptions: {
					renderTextEditsAsSummary: (uri) => {
						// render edits as summary only when using Live mode and when
						// dealing with the current file in the editor
						return isEqual(uri, editor.getModel()?.uri)
							&& configurationService.getValue<EditMode>(InlineChatConfigKeys.Mode) === EditMode.Live;
					},
				}
			}
		});
		this._disposables.add(this.widget);

		let revealFn: (() => void) | undefined;
		this._disposables.add(this.widget.chatWidget.onWillMaybeChangeHeight(() => {
			if (this.position) {
				revealFn = this._createZoneAndScrollRestoreFn(this.position);
			}
		}));
		this._disposables.add(this.widget.onDidChangeHeight(() => {
			if (this.position) {
				// only relayout when visible
				revealFn ??= this._createZoneAndScrollRestoreFn(this.position);
				const height = this._computeHeight();
				this._relayout(height.linesValue);
				revealFn();
				revealFn = undefined;
			}
		}));

		this.create();

		this._disposables.add(addDisposableListener(this.domNode, 'click', e => {
			if (!this.editor.hasWidgetFocus() && !this.widget.hasFocus()) {
				this.editor.focus();
			}
		}, true));


		// todo@jrieken listen ONLY when showing
		const updateCursorIsAboveContextKey = () => {
			if (!this.position || !this.editor.hasModel()) {
				this._ctxCursorPosition.reset();
			} else if (this.position.lineNumber === this.editor.getPosition().lineNumber) {
				this._ctxCursorPosition.set('above');
			} else if (this.position.lineNumber + 1 === this.editor.getPosition().lineNumber) {
				this._ctxCursorPosition.set('below');
			} else {
				this._ctxCursorPosition.reset();
			}
		};
		this._disposables.add(this.editor.onDidChangeCursorPosition(e => updateCursorIsAboveContextKey()));
		this._disposables.add(this.editor.onDidFocusEditorText(e => updateCursorIsAboveContextKey()));
		updateCursorIsAboveContextKey();
	}

	protected override _fillContainer(container: HTMLElement): void {
		container.appendChild(this.widget.domNode);
	}

	protected override _doLayout(heightInPixel: number): void {
		const info = this.editor.getLayoutInfo();
		let width =
			info.contentWidth - (info.glyphMarginWidth + info.decorationsWidth);
		width = Math.min(640, width);

		this._dimension = new Dimension(width, heightInPixel);
		this.widget.layout(this._dimension);
	}

	private _computeHeight(): { linesValue: number; pixelsValue: number } {
		const chatContentHeight = this.widget.contentHeight;
		const editorHeight = this.editor.getLayoutInfo().height;

		const contentHeight = Math.min(
			chatContentHeight,
			Math.max(this.widget.minHeight, editorHeight * 0.42),
		);
		const heightInLines =
			contentHeight / this.editor.getOption(EditorOption.lineHeight);
		return { linesValue: heightInLines, pixelsValue: contentHeight };
	}

	protected override _onWidth(_widthInPixel: number): void {
		if (this._dimension) {
			this._doLayout(this._dimension.height);
		}
	}

	override show(position: Position): void {
		assertType(this.container);

		const info = this.editor.getLayoutInfo();
		const marginWithoutIndentation =
			info.glyphMarginWidth +
			info.decorationsWidth +
			info.lineNumbersWidth;
		this.container.style.marginLeft = `${marginWithoutIndentation}px`;

		const revealZone = this._createZoneAndScrollRestoreFn(position);
		super.show(position, this._computeHeight().linesValue);
		this.widget.chatWidget.setVisible(true);
		this.widget.focus();

		revealZone();
		this._scrollUp.enable();
	}

	override updatePositionAndHeight(position: Position): void {
		const revealZone = this._createZoneAndScrollRestoreFn(position);
		super.updatePositionAndHeight(
			position,
			this._computeHeight().linesValue,
		);
		revealZone();
	}

	private _createZoneAndScrollRestoreFn(position: Position): () => void {
		const scrollState = StableEditorBottomScrollState.capture(this.editor);

		const lineNumber =
			position.lineNumber <= 1 ? 1 : 1 + position.lineNumber;
		const scrollTop = this.editor.getScrollTop();
		const lineTop = this.editor.getTopForLineNumber(lineNumber);
		const zoneTop = lineTop - this._computeHeight().pixelsValue;

		const hasResponse = this.widget.chatWidget.viewModel
			?.getItems()
			.find((candidate) => {
				return (
					isResponseVM(candidate) &&
					candidate.response.value.length > 0
				);
			});

		if (
			(hasResponse && zoneTop < scrollTop) ||
			this._scrollUp.didScrollUpOrDown
		) {
			// don't reveal the zone if it is already out of view (unless we are still getting ready)
			// or if an outside scroll-up happened (e.g the user scrolled up/down to see the new content)
			return this._scrollUp.runIgnored(() => {
				scrollState.restore(this.editor);
			});
		}

		return this._scrollUp.runIgnored(() => {
			scrollState.restore(this.editor);

			const scrollTop = this.editor.getScrollTop();
			const lineTop = this.editor.getTopForLineNumber(lineNumber);
			const zoneTop = lineTop - this._computeHeight().pixelsValue;
			const editorHeight = this.editor.getLayoutInfo().height;
			const lineBottom = this.editor.getBottomForLineNumber(lineNumber);

			let newScrollTop = zoneTop;
			let forceScrollTop = false;

			if (lineBottom >= scrollTop + editorHeight) {
				// revealing the top of the zone would push out the line we are interested in and
				// therefore we keep the line in the viewport
				newScrollTop = lineBottom - editorHeight;
				forceScrollTop = true;
			}

			if (newScrollTop < scrollTop || forceScrollTop) {
				this._logService.trace("[IE] REVEAL zone", {
					zoneTop,
					lineTop,
					lineBottom,
					scrollTop,
					newScrollTop,
					forceScrollTop,
				});
				this.editor.setScrollTop(newScrollTop, ScrollType.Immediate);
			}
		});
	}

	protected override revealRange(range: Range, isLastLine: boolean): void {
		// noop
	}

	protected override _getWidth(info: EditorLayoutInfo): number {
		return info.width - info.minimap.minimapWidth;
	}

	override hide(): void {
		const scrollState = StableEditorBottomScrollState.capture(this.editor);
		this._scrollUp.disable();
		this._ctxCursorPosition.reset();
		this.widget.reset();
		this.widget.chatWidget.setVisible(false);
		super.hide();
		aria.status(localize("inlineChatClosed", "Closed inline chat widget"));
		scrollState.restore(this.editor);
	}
}

class ScrollUpState {
	private _didScrollUpOrDown?: boolean;
	private _ignoreEvents = false;

	private readonly _listener = new MutableDisposable();

	constructor(private readonly _editor: ICodeEditor) {}

	dispose(): void {
		this._listener.dispose();
	}

	enable(): void {
		this._didScrollUpOrDown = undefined;
		this._listener.value = this._editor.onDidScrollChange((e) => {
			if (!e.scrollTopChanged || this._ignoreEvents) {
				return;
			}
			this._listener.clear();
			this._didScrollUpOrDown = true;
		});
	}

	disable(): void {
		this._listener.clear();
		this._didScrollUpOrDown = undefined;
	}

	runIgnored(callback: () => void): () => void {
		return () => {
			this._ignoreEvents = true;
			try {
				return callback();
			} finally {
				this._ignoreEvents = false;
			}
		};
	}

	get didScrollUpOrDown(): boolean | undefined {
		return this._didScrollUpOrDown;
	}
}
