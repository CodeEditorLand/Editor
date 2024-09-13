/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { NotSupportedError } from "../../../../base/common/errors.js";
import { Event } from "../../../../base/common/event.js";
import {
	Disposable,
	type IDisposable,
} from "../../../../base/common/lifecycle.js";
import type { URI } from "../../../../base/common/uri.js";
import {
	FilePermission,
	FileSystemProviderCapabilities,
	FileSystemProviderErrorCode,
	FileType,
	type IFileDeleteOptions,
	type IFileOverwriteOptions,
	type IFileSystemProviderWithFileReadWriteCapability,
	type IStat,
	type IWatchOptions,
} from "../../../../platform/files/common/files.js";
import {
	ChangeType,
	EDIT_SESSIONS_SCHEME,
	type EditSession,
	IEditSessionsStorageService,
	decodeEditSessionFileContent,
} from "../common/editSessions.js";

export class EditSessionsFileSystemProvider
	implements IFileSystemProviderWithFileReadWriteCapability
{
	static readonly SCHEMA = EDIT_SESSIONS_SCHEME;

	constructor(
		@IEditSessionsStorageService private editSessionsStorageService: IEditSessionsStorageService,
	) { }

	readonly capabilities: FileSystemProviderCapabilities =
		FileSystemProviderCapabilities.Readonly +
		FileSystemProviderCapabilities.FileReadWrite;

	async readFile(resource: URI): Promise<Uint8Array> {
		const match =
			/(?<ref>[^/]+)\/(?<folderName>[^/]+)\/(?<filePath>.*)/.exec(
				resource.path.substring(1),
			);
		if (!match?.groups) {
			throw FileSystemProviderErrorCode.FileNotFound;
		}
		const { ref, folderName, filePath } = match.groups;
		const data = await this.editSessionsStorageService.read(
			"editSessions",
			ref,
		);
		if (!data) {
			throw FileSystemProviderErrorCode.FileNotFound;
		}
		const content: EditSession = JSON.parse(data.content);
		const change = content.folders
			.find((f) => f.name === folderName)
			?.workingChanges.find(
				(change) => change.relativeFilePath === filePath,
			);
		if (!change || change.type === ChangeType.Deletion) {
			throw FileSystemProviderErrorCode.FileNotFound;
		}
		return decodeEditSessionFileContent(content.version, change.contents)
			.buffer;
	}

	async stat(resource: URI): Promise<IStat> {
		const content = await this.readFile(resource);
		const currentTime = Date.now();
		return {
			type: FileType.File,
			permissions: FilePermission.Readonly,
			mtime: currentTime,
			ctime: currentTime,
			size: content.byteLength,
		};
	}

	//#region Unsupported file operations
	readonly onDidChangeCapabilities = Event.None;
	readonly onDidChangeFile = Event.None;

	watch(resource: URI, opts: IWatchOptions): IDisposable {
		return Disposable.None;
	}

	async mkdir(resource: URI): Promise<void> {}
	async readdir(resource: URI): Promise<[string, FileType][]> {
		return [];
	}

	async rename(
		from: URI,
		to: URI,
		opts: IFileOverwriteOptions,
	): Promise<void> {}
	async delete(resource: URI, opts: IFileDeleteOptions): Promise<void> {}

	async writeFile() {
		throw new NotSupportedError();
	}
	//#endregion
}
