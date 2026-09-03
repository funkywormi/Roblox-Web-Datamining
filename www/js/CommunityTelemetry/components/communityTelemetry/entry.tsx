import { addLegacyExternal } from "@rbx/externals";
import * as telemetry from "@rbx/community-telemetry";

// Expose the @rbx/community-telemetry public API on window.Roblox.CommunityTelemetry so legacy
// WebApps (e.g. Roblox.Groups.WebApp) consume it via thin shims instead of build-importing the package.
// Uses addLegacyExternal (not addExternal) because this global is intentionally not a @rbx/externals
// map entry — that would externalize the package out of every workspace SCC that imports it.
addLegacyExternal(["Roblox", "CommunityTelemetry"], telemetry);
