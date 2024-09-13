/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import {
	type IWorkbenchContributionsRegistry,
	Extensions as WorkbenchExtensions,
} from "../../../common/contributions.js";
import { ExtensionsRegistry } from "../../../services/extensions/common/extensionsRegistry.js";
import { LifecyclePhase } from "../../../services/lifecycle/common/lifecycle.js";
import { ViewsWelcomeContribution } from "./viewsWelcomeContribution.js";
import {
	type ViewsWelcomeExtensionPoint,
	viewsWelcomeExtensionPointDescriptor,
} from "./viewsWelcomeExtensionPoint.js";

const extensionPoint =
	ExtensionsRegistry.registerExtensionPoint<ViewsWelcomeExtensionPoint>(
		viewsWelcomeExtensionPointDescriptor,
	);

class WorkbenchConfigurationContribution {
	constructor(
		@IInstantiationService instantiationService: IInstantiationService,
	) {
		instantiationService.createInstance(ViewsWelcomeContribution, extensionPoint);
	}
}

Registry.as<IWorkbenchContributionsRegistry>(
	WorkbenchExtensions.Workbench,
).registerWorkbenchContribution(
	WorkbenchConfigurationContribution,
	LifecyclePhase.Restored,
);
