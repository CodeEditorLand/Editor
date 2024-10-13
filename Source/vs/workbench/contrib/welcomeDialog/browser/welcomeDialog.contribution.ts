/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { RunOnceScheduler } from "../../../../base/common/async.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { ICodeEditorService } from "../../../../editor/browser/services/codeEditorService.js";
import { localize } from "../../../../nls.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import {
	Extensions as ConfigurationExtensions,
	ConfigurationScope,
	IConfigurationRegistry,
} from "../../../../platform/configuration/common/configurationRegistry.js";
import {
	ContextKeyExpr,
	IContextKeyService,
} from "../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import {
	IStorageService,
	StorageScope,
} from "../../../../platform/storage/common/storage.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { applicationConfigurationNodeBase } from "../../../common/configuration.js";
import {
	IWorkbenchContribution,
	IWorkbenchContributionsRegistry,
	Extensions as WorkbenchExtensions,
} from "../../../common/contributions.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { IBrowserWorkbenchEnvironmentService } from "../../../services/environment/browser/environmentService.js";
import { LifecyclePhase } from "../../../services/lifecycle/common/lifecycle.js";
import { WelcomeWidget } from "./welcomeWidget.js";

const configurationKey = "workbench.welcome.experimental.dialog";

class WelcomeDialogContribution
	extends Disposable
	implements IWorkbenchContribution
{
	private isRendered = false;

	constructor(
		@IStorageService storageService: IStorageService,
		@IBrowserWorkbenchEnvironmentService
		environmentService: IBrowserWorkbenchEnvironmentService,
		@IConfigurationService configurationService: IConfigurationService,
		@IContextKeyService contextService: IContextKeyService,
		@ICodeEditorService codeEditorService: ICodeEditorService,
		@IInstantiationService instantiationService: IInstantiationService,
		@ICommandService commandService: ICommandService,
		@ITelemetryService telemetryService: ITelemetryService,
		@IOpenerService openerService: IOpenerService,
		@IEditorService editorService: IEditorService,
	) {
		super();

		if (!storageService.isNew(StorageScope.APPLICATION)) {
			return; // do not show if this is not the first session
		}

		const setting = configurationService.inspect<boolean>(configurationKey);
		if (!setting.value) {
			return;
		}

		const welcomeDialog = environmentService.options?.welcomeDialog;
		if (!welcomeDialog) {
			return;
		}

		this._register(
			editorService.onDidActiveEditorChange(() => {
				if (!this.isRendered) {
					const codeEditor = codeEditorService.getActiveCodeEditor();
					if (codeEditor?.hasModel()) {
						const scheduler = new RunOnceScheduler(() => {
							const notificationsVisible =
								contextService.contextMatchesRules(
									ContextKeyExpr.deserialize(
										"notificationCenterVisible",
									),
								) ||
								contextService.contextMatchesRules(
									ContextKeyExpr.deserialize(
										"notificationToastsVisible",
									),
								);
							if (
								codeEditor ===
									codeEditorService.getActiveCodeEditor() &&
								!notificationsVisible
							) {
								this.isRendered = true;

								const welcomeWidget = new WelcomeWidget(
									codeEditor,
									instantiationService,
									commandService,
									telemetryService,
									openerService,
								);

								welcomeWidget.render(
									welcomeDialog.title,
									welcomeDialog.message,
									welcomeDialog.buttonText,
									welcomeDialog.buttonCommand,
								);
							}
						}, 3000);

						this._register(
							codeEditor.onDidChangeModelContent((e) => {
								if (!this.isRendered) {
									scheduler.schedule();
								}
							}),
						);
					}
				}
			}),
		);
	}
}

Registry.as<IWorkbenchContributionsRegistry>(
	WorkbenchExtensions.Workbench,
).registerWorkbenchContribution(
	WelcomeDialogContribution,
	LifecyclePhase.Eventually,
);

const configurationRegistry = Registry.as<IConfigurationRegistry>(
	ConfigurationExtensions.Configuration,
);
configurationRegistry.registerConfiguration({
	...applicationConfigurationNodeBase,
	properties: {
		"workbench.welcome.experimental.dialog": {
			scope: ConfigurationScope.APPLICATION,
			type: "boolean",
			default: false,
			tags: ["experimental"],
			description: localize(
				"workbench.welcome.dialog",
				"When enabled, a welcome widget is shown in the editor",
			),
		},
	},
});
