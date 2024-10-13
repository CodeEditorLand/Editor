/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { CancellationToken } from "../../../../base/common/cancellation.js";
import { Codicon } from "../../../../base/common/codicons.js";
import {
	IDataTransferItem,
	IReadonlyVSDataTransfer,
} from "../../../../base/common/dataTransfer.js";
import { HierarchicalKind } from "../../../../base/common/hierarchicalKind.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { IRange } from "../../../../editor/common/core/range.js";
import {
	DocumentPasteContext,
	DocumentPasteEditProvider,
	DocumentPasteEditsSession,
} from "../../../../editor/common/languages.js";
import { ITextModel } from "../../../../editor/common/model.js";
import { ILanguageFeaturesService } from "../../../../editor/common/services/languageFeatures.js";
import { localize } from "../../../../nls.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IChatRequestVariableEntry } from "../common/chatModel.js";
import { IChatWidgetService } from "./chat.js";
import { ChatInputPart } from "./chatInputPart.js";

export class PasteImageProvider implements DocumentPasteEditProvider {
	public readonly kind = new HierarchicalKind("image");

	public readonly pasteMimeTypes = ["image/*"];
	constructor(
		private readonly chatWidgetService: IChatWidgetService,
		private readonly configurationService: IConfigurationService,
	) {}

	async provideDocumentPasteEdits(
		_model: ITextModel,
		_ranges: readonly IRange[],
		dataTransfer: IReadonlyVSDataTransfer,
		context: DocumentPasteContext,
		token: CancellationToken,
	): Promise<DocumentPasteEditsSession | undefined> {
		if (
			!this.configurationService.getValue<boolean>(
				"chat.experimental.imageAttachments",
			)
		) {
			return;
		}

		const supportedMimeTypes = [
			"image/png",
			"image/jpeg",
			"image/jpg",
			"image/bmp",
			"image/gif",
			"image/tiff",
		];

		let mimeType: string | undefined;
		let imageItem: IDataTransferItem | undefined;

		// Find the first matching image type in the dataTransfer
		for (const type of supportedMimeTypes) {
			imageItem = dataTransfer.get(type);
			if (imageItem) {
				mimeType = type;
				break;
			}
		}

		if (!imageItem || !mimeType) {
			return;
		}
		const currClipboard = await imageItem.asFile()?.data();
		if (token.isCancellationRequested || !currClipboard) {
			return;
		}

		const widget = this.chatWidgetService.getWidgetByInputUri(_model.uri);
		if (!widget) {
			return;
		}

		const attachedVariables = widget.attachmentModel.attachments;
		const displayName = localize("pastedImageName", "Pasted Image");
		let tempDisplayName = displayName;

		for (
			let appendValue = 2;
			attachedVariables.some(
				(attachment) => attachment.name === tempDisplayName,
			);
			appendValue++
		) {
			tempDisplayName = `${displayName} ${appendValue}`;
		}

		const imageContext = await getImageAttachContext(
			currClipboard,
			mimeType,
			token,
			tempDisplayName,
		);

		if (token.isCancellationRequested || !imageContext) {
			return;
		}

		// Make sure to attach only new contexts
		const currentContextIds = widget.attachmentModel.getAttachmentIDs();
		if (currentContextIds.has(imageContext.id)) {
			return;
		}

		widget.attachmentModel.addContext(imageContext);

		return;
	}
}

async function getImageAttachContext(
	data: Uint8Array,
	mimeType: string,
	token: CancellationToken,
	displayName: string,
): Promise<IChatRequestVariableEntry | undefined> {
	const imageHash = await imageToHash(data);
	if (token.isCancellationRequested) {
		return undefined;
	}

	return {
		value: data,
		id: imageHash,
		name: displayName,
		isImage: true,
		icon: Codicon.fileMedia,
		isDynamic: true,
		isFile: false,
		mimeType,
	};
}

export async function imageToHash(data: Uint8Array): Promise<string> {
	const hashBuffer = await crypto.subtle.digest("SHA-256", data);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function isImage(array: Uint8Array): boolean {
	if (array.length < 4) {
		return false;
	}

	// Magic numbers (identification bytes) for various image formats
	const identifier: { [key: string]: number[] } = {
		png: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
		jpeg: [0xff, 0xd8, 0xff],
		bmp: [0x42, 0x4d],
		gif: [0x47, 0x49, 0x46, 0x38],
		tiff: [0x49, 0x49, 0x2a, 0x00],
	};

	return Object.values(identifier).some((signature) =>
		signature.every((byte, index) => array[index] === byte),
	);
}

export class ChatPasteProvidersFeature extends Disposable {
	constructor(
		@ILanguageFeaturesService
		languageFeaturesService: ILanguageFeaturesService,
		@IChatWidgetService chatWidgetService: IChatWidgetService,
		@IConfigurationService configurationService: IConfigurationService,
	) {
		super();
		this._register(
			languageFeaturesService.documentPasteEditProvider.register(
				{
					scheme: ChatInputPart.INPUT_SCHEME,
					pattern: "*",
					hasAccessToAllModels: true,
				},
				new PasteImageProvider(chatWidgetService, configurationService),
			),
		);
	}
}
