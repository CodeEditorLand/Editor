/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { isLinux, isWindows } from "../../../../base/common/platform.js";
import { AccessibilityService } from "../../../../platform/accessibility/browser/accessibilityService.js";
import {
	AccessibilitySupport,
	IAccessibilityService,
} from "../../../../platform/accessibility/common/accessibility.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import {
	InstantiationType,
	registerSingleton,
} from "../../../../platform/instantiation/common/extensions.js";
import { ILayoutService } from "../../../../platform/layout/browser/layoutService.js";
import { INativeHostService } from "../../../../platform/native/common/native.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import {
	IWorkbenchContribution,
	registerWorkbenchContribution2,
	WorkbenchPhase,
} from "../../../common/contributions.js";
import { IJSONEditingService } from "../../configuration/common/jsonEditing.js";
import { INativeWorkbenchEnvironmentService } from "../../environment/electron-sandbox/environmentService.js";

interface AccessibilityMetrics {
	enabled: boolean;
}
type AccessibilityMetricsClassification = {
	owner: "isidorn";
	comment: "Helps gain an understanding of when accessibility features are being used";
	enabled: {
		classification: "SystemMetaData";
		purpose: "FeatureInsight";
		comment: "Whether or not accessibility features are enabled";
	};
};

export class NativeAccessibilityService
	extends AccessibilityService
	implements IAccessibilityService
{
	private didSendTelemetry = false;
	private shouldAlwaysUnderlineAccessKeys: boolean | undefined = undefined;

	constructor(
		@INativeWorkbenchEnvironmentService
		environmentService: INativeWorkbenchEnvironmentService,
		@IContextKeyService contextKeyService: IContextKeyService,
		@IConfigurationService configurationService: IConfigurationService,
		@ILayoutService _layoutService: ILayoutService,
		@ITelemetryService
		private readonly _telemetryService: ITelemetryService,
		@INativeHostService
		private readonly nativeHostService: INativeHostService,
	) {
		super(contextKeyService, _layoutService, configurationService);
		this.setAccessibilitySupport(
			environmentService.window.accessibilitySupport
				? AccessibilitySupport.Enabled
				: AccessibilitySupport.Disabled,
		);
	}

	override async alwaysUnderlineAccessKeys(): Promise<boolean> {
		if (!isWindows) {
			return false;
		}

		if (typeof this.shouldAlwaysUnderlineAccessKeys !== "boolean") {
			const windowsKeyboardAccessibility =
				await this.nativeHostService.windowsGetStringRegKey(
					"HKEY_CURRENT_USER",
					"Control Panel\\Accessibility\\Keyboard Preference",
					"On",
				);
			this.shouldAlwaysUnderlineAccessKeys =
				windowsKeyboardAccessibility === "1";
		}

		return this.shouldAlwaysUnderlineAccessKeys;
	}

	override setAccessibilitySupport(
		accessibilitySupport: AccessibilitySupport,
	): void {
		super.setAccessibilitySupport(accessibilitySupport);

		if (
			!this.didSendTelemetry &&
			accessibilitySupport === AccessibilitySupport.Enabled
		) {
			this._telemetryService.publicLog2<
				AccessibilityMetrics,
				AccessibilityMetricsClassification
			>("accessibility", { enabled: true });
			this.didSendTelemetry = true;
		}
	}
}

registerSingleton(
	IAccessibilityService,
	NativeAccessibilityService,
	InstantiationType.Delayed,
);

// On linux we do not automatically detect that a screen reader is detected, thus we have to implicitly notify the renderer to enable accessibility when user configures it in settings
class LinuxAccessibilityContribution implements IWorkbenchContribution {
	static readonly ID = "workbench.contrib.linuxAccessibility";

	constructor(
		@IJSONEditingService jsonEditingService: IJSONEditingService,
		@IAccessibilityService accessibilityService: IAccessibilityService,
		@INativeWorkbenchEnvironmentService
		environmentService: INativeWorkbenchEnvironmentService,
	) {
		const forceRendererAccessibility = () => {
			if (accessibilityService.isScreenReaderOptimized()) {
				jsonEditingService.write(
					environmentService.argvResource,
					[{ path: ["force-renderer-accessibility"], value: true }],
					true,
				);
			}
		};
		forceRendererAccessibility();
		accessibilityService.onDidChangeScreenReaderOptimized(
			forceRendererAccessibility,
		);
	}
}

if (isLinux) {
	registerWorkbenchContribution2(
		LinuxAccessibilityContribution.ID,
		LinuxAccessibilityContribution,
		WorkbenchPhase.BlockRestore,
	);
}
