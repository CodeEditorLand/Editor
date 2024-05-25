/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Codicon } from "vs/base/common/codicons";
import { localize } from "vs/nls";
import type { ILocalizedString } from "vs/platform/action/common/action";
import {
	type ISubmenuItem,
	MenuId,
	MenuRegistry,
} from "vs/platform/actions/common/actions";
import {
	CommandsRegistry,
	type ICommandHandler,
} from "vs/platform/commands/common/commands";
import {
	Extensions as ConfigurationExtensions,
	type IConfigurationRegistry,
} from "vs/platform/configuration/common/configurationRegistry";
import { ContextKeyExpr } from "vs/platform/contextkey/common/contextkey";
import { SyncDescriptor } from "vs/platform/instantiation/common/descriptors";
import {
	InstantiationType,
	registerSingleton,
} from "vs/platform/instantiation/common/extensions";
import { Registry } from "vs/platform/registry/common/platform";
import { registerIcon } from "vs/platform/theme/common/iconRegistry";
import { ResourceContextKey } from "vs/workbench/common/contextkeys";
import {
	type IViewDescriptor,
	type IViewsRegistry,
	Extensions as ViewExtensions,
} from "vs/workbench/common/views";
import { VIEW_CONTAINER } from "vs/workbench/contrib/files/browser/explorerViewlet";
import { ExplorerFolderContext } from "vs/workbench/contrib/files/common/files";
import {
	ITimelineService,
	TimelinePaneId,
} from "vs/workbench/contrib/timeline/common/timeline";
import {
	TimelineHasProviderContext,
	TimelineService,
} from "vs/workbench/contrib/timeline/common/timelineService";
import { TimelinePane } from "./timelinePane";

const timelineViewIcon = registerIcon(
	"timeline-view-icon",
	Codicon.history,
	localize("timelineViewIcon", "View icon of the timeline view."),
);
const timelineOpenIcon = registerIcon(
	"timeline-open",
	Codicon.history,
	localize("timelineOpenIcon", "Icon for the open timeline action."),
);

export class TimelinePaneDescriptor implements IViewDescriptor {
	readonly id = TimelinePaneId;
	readonly name: ILocalizedString = TimelinePane.TITLE;
	readonly containerIcon = timelineViewIcon;
	readonly ctorDescriptor = new SyncDescriptor(TimelinePane);
	readonly order = 2;
	readonly weight = 30;
	readonly collapsed = true;
	readonly canToggleVisibility = true;
	readonly hideByDefault = false;
	readonly canMoveView = true;
	readonly when = TimelineHasProviderContext;

	focusCommand = { id: "timeline.focus" };
}

// Configuration
const configurationRegistry = Registry.as<IConfigurationRegistry>(
	ConfigurationExtensions.Configuration,
);
configurationRegistry.registerConfiguration({
	id: "timeline",
	order: 1001,
	title: localize("timelineConfigurationTitle", "Timeline"),
	type: "object",
	properties: {
		"timeline.pageSize": {
			type: ["number", "null"],
			default: null,
			markdownDescription: localize(
				"timeline.pageSize",
				"The number of items to show in the Timeline view by default and when loading more items. Setting to `null` (the default) will automatically choose a page size based on the visible area of the Timeline view.",
			),
		},
		"timeline.pageOnScroll": {
			type: "boolean",
			default: false,
			description: localize(
				"timeline.pageOnScroll",
				"Experimental. Controls whether the Timeline view will load the next page of items when you scroll to the end of the list.",
			),
		},
	},
});

Registry.as<IViewsRegistry>(ViewExtensions.ViewsRegistry).registerViews(
	[new TimelinePaneDescriptor()],
	VIEW_CONTAINER,
);

namespace OpenTimelineAction {
	export const ID = "files.openTimeline";
	export const LABEL = localize("files.openTimeline", "Open Timeline");

	export function handler(): ICommandHandler {
		return (accessor, arg) => {
			const service = accessor.get(ITimelineService);
			return service.setUri(arg);
		};
	}
}

CommandsRegistry.registerCommand(
	OpenTimelineAction.ID,
	OpenTimelineAction.handler(),
);

MenuRegistry.appendMenuItem(MenuId.ExplorerContext, {
	group: "4_timeline",
	order: 1,
	command: {
		id: OpenTimelineAction.ID,
		title: OpenTimelineAction.LABEL,
		icon: timelineOpenIcon,
	},
	when: ContextKeyExpr.and(
		ExplorerFolderContext.toNegated(),
		ResourceContextKey.HasResource,
		TimelineHasProviderContext,
	),
});

const timelineFilter = registerIcon(
	"timeline-filter",
	Codicon.filter,
	localize("timelineFilter", "Icon for the filter timeline action."),
);

MenuRegistry.appendMenuItem(MenuId.TimelineTitle, {
	submenu: MenuId.TimelineFilterSubMenu,
	title: localize("filterTimeline", "Filter Timeline"),
	group: "navigation",
	order: 100,
	icon: timelineFilter,
} satisfies ISubmenuItem);

registerSingleton(ITimelineService, TimelineService, InstantiationType.Delayed);
