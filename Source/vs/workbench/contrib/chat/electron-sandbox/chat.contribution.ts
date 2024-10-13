/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { registerAction2 } from "../../../../platform/actions/common/actions.js";
import {
	registerWorkbenchContribution2,
	WorkbenchPhase,
} from "../../../common/contributions.js";
import {
	HoldToVoiceChatInChatViewAction,
	InlineVoiceChatAction,
	InstallSpeechProviderForVoiceChatAction,
	KeywordActivationContribution,
	QuickVoiceChatAction,
	ReadChatResponseAloud,
	StartVoiceChatAction,
	StopListeningAction,
	StopListeningAndSubmitAction,
	StopReadAloud,
	StopReadChatItemAloud,
	VoiceChatInChatViewAction,
} from "./actions/voiceChatActions.js";

registerAction2(StartVoiceChatAction);
registerAction2(InstallSpeechProviderForVoiceChatAction);

registerAction2(VoiceChatInChatViewAction);
registerAction2(HoldToVoiceChatInChatViewAction);
registerAction2(QuickVoiceChatAction);
registerAction2(InlineVoiceChatAction);

registerAction2(StopListeningAction);
registerAction2(StopListeningAndSubmitAction);

registerAction2(ReadChatResponseAloud);
registerAction2(StopReadChatItemAloud);
registerAction2(StopReadAloud);

registerWorkbenchContribution2(
	KeywordActivationContribution.ID,
	KeywordActivationContribution,
	WorkbenchPhase.AfterRestored,
);
