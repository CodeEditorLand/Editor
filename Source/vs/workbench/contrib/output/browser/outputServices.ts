/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Emitter, Event } from "../../../../base/common/event.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { Schemas } from "../../../../base/common/network.js";
import { URI } from "../../../../base/common/uri.js";
import { ILanguageService } from "../../../../editor/common/languages/language.js";
import { ITextModel } from "../../../../editor/common/model.js";
import {
	ITextModelContentProvider,
	ITextModelService,
} from "../../../../editor/common/services/resolverService.js";
import {
	IContextKey,
	IContextKeyService,
} from "../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import {
	ILoggerService,
	ILogService,
	LogLevelToString,
} from "../../../../platform/log/common/log.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import {
	IStorageService,
	StorageScope,
	StorageTarget,
} from "../../../../platform/storage/common/storage.js";
import { ILifecycleService } from "../../../services/lifecycle/common/lifecycle.js";
import {
	ACTIVE_OUTPUT_CHANNEL_CONTEXT,
	CONTEXT_ACTIVE_FILE_OUTPUT,
	CONTEXT_ACTIVE_OUTPUT_LEVEL,
	CONTEXT_ACTIVE_OUTPUT_LEVEL_IS_DEFAULT,
	CONTEXT_ACTIVE_OUTPUT_LEVEL_SETTABLE,
	Extensions,
	IOutputChannel,
	IOutputChannelDescriptor,
	IOutputChannelRegistry,
	IOutputService,
	LOG_MIME,
	OUTPUT_MIME,
	OUTPUT_VIEW_ID,
	OutputChannelUpdateMode,
} from "../../../services/output/common/output.js";
import { IViewsService } from "../../../services/views/common/viewsService.js";
import { IDefaultLogLevelsService } from "../../logs/common/defaultLogLevels.js";
import { SetLogLevelAction } from "../../logs/common/logsActions.js";
import { IOutputChannelModel } from "../common/outputChannelModel.js";
import { IOutputChannelModelService } from "../common/outputChannelModelService.js";
import { OutputLinkProvider } from "./outputLinkProvider.js";
import { OutputViewPane } from "./outputView.js";

const OUTPUT_ACTIVE_CHANNEL_KEY = "output.activechannel";

class OutputChannel extends Disposable implements IOutputChannel {
	scrollLock: boolean = false;
	readonly model: IOutputChannelModel;
	readonly id: string;
	readonly label: string;
	readonly uri: URI;

	constructor(
		readonly outputChannelDescriptor: IOutputChannelDescriptor,
		@IOutputChannelModelService
		outputChannelModelService: IOutputChannelModelService,
		@ILanguageService languageService: ILanguageService,
	) {
		super();
		this.id = outputChannelDescriptor.id;
		this.label = outputChannelDescriptor.label;
		this.uri = URI.from({ scheme: Schemas.outputChannel, path: this.id });
		this.model = this._register(
			outputChannelModelService.createOutputChannelModel(
				this.id,
				this.uri,
				outputChannelDescriptor.languageId
					? languageService.createById(
							outputChannelDescriptor.languageId,
						)
					: languageService.createByMimeType(
							outputChannelDescriptor.log
								? LOG_MIME
								: OUTPUT_MIME,
						),
				outputChannelDescriptor.file,
			),
		);
	}

	append(output: string): void {
		this.model.append(output);
	}

	update(mode: OutputChannelUpdateMode, till?: number): void {
		this.model.update(mode, till, true);
	}

	clear(): void {
		this.model.clear();
	}

	replace(value: string): void {
		this.model.replace(value);
	}
}

export class OutputService
	extends Disposable
	implements IOutputService, ITextModelContentProvider
{
	declare readonly _serviceBrand: undefined;

	private channels: Map<string, OutputChannel> = new Map<
		string,
		OutputChannel
	>();
	private activeChannelIdInStorage: string;
	private activeChannel?: OutputChannel;

	private readonly _onActiveOutputChannel = this._register(
		new Emitter<string>(),
	);
	readonly onActiveOutputChannel: Event<string> =
		this._onActiveOutputChannel.event;

	private readonly activeOutputChannelContext: IContextKey<string>;
	private readonly activeFileOutputChannelContext: IContextKey<boolean>;
	private readonly activeOutputChannelLevelSettableContext: IContextKey<boolean>;
	private readonly activeOutputChannelLevelContext: IContextKey<string>;
	private readonly activeOutputChannelLevelIsDefaultContext: IContextKey<boolean>;

	constructor(
		@IStorageService private readonly storageService: IStorageService,
		@IInstantiationService
		private readonly instantiationService: IInstantiationService,
		@ITextModelService textModelResolverService: ITextModelService,
		@ILogService private readonly logService: ILogService,
		@ILoggerService private readonly loggerService: ILoggerService,
		@ILifecycleService private readonly lifecycleService: ILifecycleService,
		@IViewsService private readonly viewsService: IViewsService,
		@IContextKeyService contextKeyService: IContextKeyService,
		@IDefaultLogLevelsService
		private readonly defaultLogLevelsService: IDefaultLogLevelsService,
	) {
		super();
		this.activeChannelIdInStorage = this.storageService.get(
			OUTPUT_ACTIVE_CHANNEL_KEY,
			StorageScope.WORKSPACE,
			"",
		);
		this.activeOutputChannelContext =
			ACTIVE_OUTPUT_CHANNEL_CONTEXT.bindTo(contextKeyService);
		this.activeOutputChannelContext.set(this.activeChannelIdInStorage);
		this._register(
			this.onActiveOutputChannel((channel) =>
				this.activeOutputChannelContext.set(channel),
			),
		);

		this.activeFileOutputChannelContext =
			CONTEXT_ACTIVE_FILE_OUTPUT.bindTo(contextKeyService);
		this.activeOutputChannelLevelSettableContext =
			CONTEXT_ACTIVE_OUTPUT_LEVEL_SETTABLE.bindTo(contextKeyService);
		this.activeOutputChannelLevelContext =
			CONTEXT_ACTIVE_OUTPUT_LEVEL.bindTo(contextKeyService);
		this.activeOutputChannelLevelIsDefaultContext =
			CONTEXT_ACTIVE_OUTPUT_LEVEL_IS_DEFAULT.bindTo(contextKeyService);

		// Register as text model content provider for output
		this._register(
			textModelResolverService.registerTextModelContentProvider(
				Schemas.outputChannel,
				this,
			),
		);
		this._register(instantiationService.createInstance(OutputLinkProvider));

		// Create output channels for already registered channels
		const registry = Registry.as<IOutputChannelRegistry>(
			Extensions.OutputChannels,
		);
		for (const channelIdentifier of registry.getChannels()) {
			this.onDidRegisterChannel(channelIdentifier.id);
		}
		this._register(
			registry.onDidRegisterChannel(this.onDidRegisterChannel, this),
		);

		// Set active channel to first channel if not set
		if (!this.activeChannel) {
			const channels = this.getChannelDescriptors();
			this.setActiveChannel(
				channels && channels.length > 0
					? this.getChannel(channels[0].id)
					: undefined,
			);
		}

		this._register(
			Event.filter(
				this.viewsService.onDidChangeViewVisibility,
				(e) => e.id === OUTPUT_VIEW_ID && e.visible,
			)(() => {
				if (this.activeChannel) {
					this.viewsService
						.getActiveViewWithId<OutputViewPane>(OUTPUT_VIEW_ID)
						?.showChannel(this.activeChannel, true);
				}
			}),
		);

		this._register(
			this.loggerService.onDidChangeLogLevel((_level) => {
				this.setLevelContext();
				this.setLevelIsDefaultContext();
			}),
		);
		this._register(
			this.defaultLogLevelsService.onDidChangeDefaultLogLevels(() => {
				this.setLevelIsDefaultContext();
			}),
		);

		this._register(
			this.lifecycleService.onDidShutdown(() => this.dispose()),
		);
	}

	provideTextContent(resource: URI): Promise<ITextModel> | null {
		const channel = <OutputChannel>this.getChannel(resource.path);
		if (channel) {
			return channel.model.loadModel();
		}
		return null;
	}

	async showChannel(id: string, preserveFocus?: boolean): Promise<void> {
		const channel = this.getChannel(id);
		if (this.activeChannel?.id !== channel?.id) {
			this.setActiveChannel(channel);
			this._onActiveOutputChannel.fire(id);
		}
		const outputView = await this.viewsService.openView<OutputViewPane>(
			OUTPUT_VIEW_ID,
			!preserveFocus,
		);
		if (outputView && channel) {
			outputView.showChannel(channel, !!preserveFocus);
		}
	}

	getChannel(id: string): OutputChannel | undefined {
		return this.channels.get(id);
	}

	getChannelDescriptor(id: string): IOutputChannelDescriptor | undefined {
		return Registry.as<IOutputChannelRegistry>(
			Extensions.OutputChannels,
		).getChannel(id);
	}

	getChannelDescriptors(): IOutputChannelDescriptor[] {
		return Registry.as<IOutputChannelRegistry>(
			Extensions.OutputChannels,
		).getChannels();
	}

	getActiveChannel(): IOutputChannel | undefined {
		return this.activeChannel;
	}

	private async onDidRegisterChannel(channelId: string): Promise<void> {
		const channel = this.createChannel(channelId);
		this.channels.set(channelId, channel);
		if (
			!this.activeChannel ||
			this.activeChannelIdInStorage === channelId
		) {
			this.setActiveChannel(channel);
			this._onActiveOutputChannel.fire(channelId);
			const outputView =
				this.viewsService.getActiveViewWithId<OutputViewPane>(
					OUTPUT_VIEW_ID,
				);
			outputView?.showChannel(channel, true);
		}
	}

	private createChannel(id: string): OutputChannel {
		const channel = this.instantiateChannel(id);
		this._register(
			Event.once(channel.model.onDispose)(() => {
				if (this.activeChannel === channel) {
					const channels = this.getChannelDescriptors();
					const channel = channels.length
						? this.getChannel(channels[0].id)
						: undefined;
					if (
						channel &&
						this.viewsService.isViewVisible(OUTPUT_VIEW_ID)
					) {
						this.showChannel(channel.id);
					} else {
						this.setActiveChannel(undefined);
					}
				}
				Registry.as<IOutputChannelRegistry>(
					Extensions.OutputChannels,
				).removeChannel(id);
			}),
		);

		return channel;
	}

	private instantiateChannel(id: string): OutputChannel {
		const channelData = Registry.as<IOutputChannelRegistry>(
			Extensions.OutputChannels,
		).getChannel(id);
		if (!channelData) {
			this.logService.error(`Channel '${id}' is not registered yet`);
			throw new Error(`Channel '${id}' is not registered yet`);
		}
		return this.instantiationService.createInstance(
			OutputChannel,
			channelData,
		);
	}

	private setLevelContext(): void {
		const descriptor = this.activeChannel?.outputChannelDescriptor;
		const channelLogLevel = descriptor?.log
			? this.loggerService.getLogLevel(descriptor.file)
			: undefined;
		this.activeOutputChannelLevelContext.set(
			channelLogLevel !== undefined
				? LogLevelToString(channelLogLevel)
				: "",
		);
	}

	private async setLevelIsDefaultContext(): Promise<void> {
		const descriptor = this.activeChannel?.outputChannelDescriptor;
		if (descriptor?.log) {
			const channelLogLevel = this.loggerService.getLogLevel(
				descriptor.file,
			);
			const channelDefaultLogLevel =
				await this.defaultLogLevelsService.getDefaultLogLevel(
					descriptor.extensionId,
				);
			this.activeOutputChannelLevelIsDefaultContext.set(
				channelDefaultLogLevel === channelLogLevel,
			);
		} else {
			this.activeOutputChannelLevelIsDefaultContext.set(false);
		}
	}

	private setActiveChannel(channel: OutputChannel | undefined): void {
		this.activeChannel = channel;
		const descriptor = channel?.outputChannelDescriptor;
		this.activeFileOutputChannelContext.set(!!descriptor?.file);
		this.activeOutputChannelLevelSettableContext.set(
			descriptor !== undefined &&
				SetLogLevelAction.isLevelSettable(descriptor),
		);
		this.setLevelIsDefaultContext();
		this.setLevelContext();

		if (this.activeChannel) {
			this.storageService.store(
				OUTPUT_ACTIVE_CHANNEL_KEY,
				this.activeChannel.id,
				StorageScope.WORKSPACE,
				StorageTarget.MACHINE,
			);
		} else {
			this.storageService.remove(
				OUTPUT_ACTIVE_CHANNEL_KEY,
				StorageScope.WORKSPACE,
			);
		}
	}
}
