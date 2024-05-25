/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { getActiveWindow } from "vs/base/browser/dom";
import { Event } from "vs/base/common/event";
import { DisposableStore } from "vs/base/common/lifecycle";
import { localize } from "vs/nls";
import { BrowserClipboardService as BaseBrowserClipboardService } from "vs/platform/clipboard/browser/clipboardService";
import { IClipboardService } from "vs/platform/clipboard/common/clipboardService";
import {
	InstantiationType,
	registerSingleton,
} from "vs/platform/instantiation/common/extensions";
import { ILayoutService } from "vs/platform/layout/browser/layoutService";
import { ILogService } from "vs/platform/log/common/log";
import {
	INotificationService,
	Severity,
} from "vs/platform/notification/common/notification";
import { IOpenerService } from "vs/platform/opener/common/opener";
import { IWorkbenchEnvironmentService } from "vs/workbench/services/environment/common/environmentService";

export class BrowserClipboardService extends BaseBrowserClipboardService {
	constructor(
		@INotificationService private readonly notificationService: INotificationService,
		@IOpenerService private readonly openerService: IOpenerService,
		@IWorkbenchEnvironmentService private readonly environmentService: IWorkbenchEnvironmentService,
		@ILogService logService: ILogService,
		@ILayoutService layoutService: ILayoutService
	) {
		super(layoutService, logService);
	}

	override async readText(type?: string): Promise<string> {
		if (type) {
			return super.readText(type);
		}

		try {
			return await getActiveWindow().navigator.clipboard.readText();
		} catch (error) {
			if (!!this.environmentService.extensionTestsLocationURI) {
				return ""; // do not ask for input in tests (https://github.com/microsoft/vscode/issues/112264)
			}

			return new Promise<string>((resolve) => {
				// Inform user about permissions problem (https://github.com/microsoft/vscode/issues/112089)
				const listener = new DisposableStore();
				const handle = this.notificationService.prompt(
					Severity.Error,
					localize(
						"clipboardError",
						"Unable to read from the browser's clipboard. Please make sure you have granted access for this website to read from the clipboard.",
					),
					[
						{
							label: localize("retry", "Retry"),
							run: async () => {
								listener.dispose();
								resolve(await this.readText(type));
							},
						},
						{
							label: localize("learnMore", "Learn More"),
							run: () =>
								this.openerService.open(
									"https://go.microsoft.com/fwlink/?linkid=2151362",
								),
						},
					],
					{
						sticky: true,
					},
				);

				// Always resolve the promise once the notification closes
				listener.add(Event.once(handle.onDidClose)(() => resolve("")));
			});
		}
	}
}

registerSingleton(
	IClipboardService,
	BrowserClipboardService,
	InstantiationType.Delayed,
);
