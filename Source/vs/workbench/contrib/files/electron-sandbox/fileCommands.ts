/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { sequence } from "vs/base/common/async";
import { Schemas } from "vs/base/common/network";
import type { URI } from "vs/base/common/uri";
import type { INativeHostService } from "vs/platform/native/common/native";
import type { IWorkspaceContextService } from "vs/platform/workspace/common/workspace";

// Commands

export function revealResourcesInOS(
	resources: URI[],
	nativeHostService: INativeHostService,
	workspaceContextService: IWorkspaceContextService,
): void {
	if (resources.length) {
		sequence(
			resources.map((r) => async () => {
				if (
					r.scheme === Schemas.file ||
					r.scheme === Schemas.vscodeUserData
				) {
					nativeHostService.showItemInFolder(
						r.with({ scheme: Schemas.file }).fsPath,
					);
				}
			}),
		);
	} else if (workspaceContextService.getWorkspace().folders.length) {
		const uri = workspaceContextService.getWorkspace().folders[0].uri;
		if (uri.scheme === Schemas.file) {
			nativeHostService.showItemInFolder(uri.fsPath);
		}
	}
}
