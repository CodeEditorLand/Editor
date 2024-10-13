/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { SyncDescriptor } from "../../../../platform/instantiation/common/descriptors.js";
import {
	InstantiationType,
	registerSingleton,
} from "../../../../platform/instantiation/common/extensions.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import {
	EditorPaneDescriptor,
	IEditorPaneRegistry,
} from "../../../browser/editor.js";
import {
	registerWorkbenchContribution2,
	WorkbenchPhase,
} from "../../../common/contributions.js";
import {
	EditorExtensions,
	IEditorFactoryRegistry,
} from "../../../common/editor.js";
import { WebviewEditor } from "../../webviewPanel/browser/webviewEditor.js";
import { ICustomEditorService } from "../common/customEditor.js";
import { CustomEditorInput } from "./customEditorInput.js";
import {
	ComplexCustomWorkingCopyEditorHandler,
	CustomEditorInputSerializer,
} from "./customEditorInputFactory.js";
import { CustomEditorService } from "./customEditors.js";

registerSingleton(
	ICustomEditorService,
	CustomEditorService,
	InstantiationType.Delayed,
);

Registry.as<IEditorPaneRegistry>(
	EditorExtensions.EditorPane,
).registerEditorPane(
	EditorPaneDescriptor.create(
		WebviewEditor,
		WebviewEditor.ID,
		"Webview Editor",
	),
	[new SyncDescriptor(CustomEditorInput)],
);

Registry.as<IEditorFactoryRegistry>(
	EditorExtensions.EditorFactory,
).registerEditorSerializer(
	CustomEditorInputSerializer.ID,
	CustomEditorInputSerializer,
);

registerWorkbenchContribution2(
	ComplexCustomWorkingCopyEditorHandler.ID,
	ComplexCustomWorkingCopyEditorHandler,
	WorkbenchPhase.BlockStartup,
);
