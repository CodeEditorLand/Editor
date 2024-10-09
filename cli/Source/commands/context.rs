// ---------------------------------------------------------------------------------------------
//  Copyright (c) Microsoft Corporation. All rights reserved.
//  Licensed under the MIT License. See License.txt in the project root for
// license information.
// --------------------------------------------------------------------------------------------

use super::args::CliCore;
use crate::{log, state::LauncherPaths};

pub struct CommandContext {
	pub log:log::Logger,
	pub paths:LauncherPaths,
	pub args:CliCore,
	pub http:reqwest::Client,
}
