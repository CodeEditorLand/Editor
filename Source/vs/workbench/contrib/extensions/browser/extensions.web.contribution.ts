/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { localize } from "../../../../nls.js";
import { SyncDescriptor } from "../../../../platform/instantiation/common/descriptors.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import {
	EditorPaneDescriptor,
	IEditorPaneRegistry,
} from "../../../browser/editor.js";
import { EditorExtensions } from "../../../common/editor.js";
import { RuntimeExtensionsInput } from "../common/runtimeExtensionsInput.js";
import { RuntimeExtensionsEditor } from "./browserRuntimeExtensionsEditor.js";

// Running Extensions
Registry.as<IEditorPaneRegistry>(
	EditorExtensions.EditorPane,
).registerEditorPane(
	EditorPaneDescriptor.create(
		RuntimeExtensionsEditor,
		RuntimeExtensionsEditor.ID,
		localize("runtimeExtension", "Running Extensions"),
	),
	[new SyncDescriptor(RuntimeExtensionsInput)],
);
