/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import {
	Extensions,
	type IConfigurationRegistry,
} from "../../../../platform/configuration/common/configurationRegistry.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import {
	type IWorkbenchContributionsRegistry,
	Extensions as WorkbenchExtensions,
} from "../../../common/contributions.js";
import { ExtensionsRegistry } from "../../../services/extensions/common/extensionsRegistry.js";
import { LifecyclePhase } from "../../../services/lifecycle/common/lifecycle.js";
import {
	type CodeActionsExtensionPoint,
	codeActionsExtensionPointDescriptor,
} from "../common/codeActionsExtensionPoint.js";
import {
	type DocumentationExtensionPoint,
	documentationExtensionPointDescriptor,
} from "../common/documentationExtensionPoint.js";
import {
	CodeActionsContribution,
	editorConfiguration,
	notebookEditorConfiguration,
} from "./codeActionsContribution.js";
import { CodeActionDocumentationContribution } from "./documentationContribution.js";

const codeActionsExtensionPoint = ExtensionsRegistry.registerExtensionPoint<
	CodeActionsExtensionPoint[]
>(codeActionsExtensionPointDescriptor);
const documentationExtensionPoint =
	ExtensionsRegistry.registerExtensionPoint<DocumentationExtensionPoint>(
		documentationExtensionPointDescriptor,
	);

Registry.as<IConfigurationRegistry>(
	Extensions.Configuration,
).registerConfiguration(editorConfiguration);

Registry.as<IConfigurationRegistry>(
	Extensions.Configuration,
).registerConfiguration(notebookEditorConfiguration);

class WorkbenchConfigurationContribution {
	constructor(
		@IInstantiationService instantiationService: IInstantiationService,
	) {
		instantiationService.createInstance(
			CodeActionsContribution,
			codeActionsExtensionPoint,
		);
		instantiationService.createInstance(
			CodeActionDocumentationContribution,
			documentationExtensionPoint,
		);
	}
}

Registry.as<IWorkbenchContributionsRegistry>(
	WorkbenchExtensions.Workbench,
).registerWorkbenchContribution(
	WorkbenchConfigurationContribution,
	LifecyclePhase.Eventually,
);
