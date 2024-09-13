/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Emitter } from "../../../../../base/common/event.js";
import {
	Disposable,
	type IDisposable,
} from "../../../../../base/common/lifecycle.js";
import { localize } from "../../../../../nls.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import type { IChatProgressRenderableResponseContent } from "../../common/chatModel.js";
import {
	type IChatConfirmation,
	type IChatSendRequestOptions,
	IChatService,
} from "../../common/chatService.js";
import { isResponseVM } from "../../common/chatViewModel.js";
import { ChatConfirmationWidget } from "./chatConfirmationWidget.js";
import type {
	IChatContentPart,
	IChatContentPartRenderContext,
} from "./chatContentParts.js";

export class ChatConfirmationContentPart
	extends Disposable
	implements IChatContentPart
{
	public readonly domNode: HTMLElement;

	private readonly _onDidChangeHeight = this._register(new Emitter<void>());
	public readonly onDidChangeHeight = this._onDidChangeHeight.event;

	constructor(
		confirmation: IChatConfirmation,
		context: IChatContentPartRenderContext,
		@IInstantiationService private readonly instantiationService: IInstantiationService,
		@IChatService private readonly chatService: IChatService,
	) {
		super();

		const element = context.element;
		const buttons = confirmation.buttons
			? confirmation.buttons.map(button => ({
				label: button,
				data: confirmation.data
			}))
			: [
				{ label: localize('accept', "Accept"), data: confirmation.data },
				{ label: localize('dismiss', "Dismiss"), data: confirmation.data, isSecondary: true },
			];
		const confirmationWidget = this._register(this.instantiationService.createInstance(ChatConfirmationWidget, confirmation.title, confirmation.message, buttons));
		confirmationWidget.setShowButtons(!confirmation.isUsed);

		this._register(confirmationWidget.onDidClick(async e => {
			if (isResponseVM(element)) {
				const prompt = `${e.label}: "${confirmation.title}"`;
				const data: IChatSendRequestOptions = e.isSecondary ?
					{ rejectedConfirmationData: [e.data] } :
					{ acceptedConfirmationData: [e.data] };
				data.agentId = element.agent?.id;
				data.slashCommand = element.slashCommand?.name;
				data.confirmation = e.label;
				if (await this.chatService.sendRequest(element.sessionId, prompt, data)) {
					confirmation.isUsed = true;
					confirmationWidget.setShowButtons(false);
					this._onDidChangeHeight.fire();
				}
			}
		}));

		this.domNode = confirmationWidget.domNode;
	}

	hasSameContent(other: IChatProgressRenderableResponseContent): boolean {
		// No other change allowed for this content type
		return other.kind === "confirmation";
	}

	addDisposable(disposable: IDisposable): void {
		this._register(disposable);
	}
}
