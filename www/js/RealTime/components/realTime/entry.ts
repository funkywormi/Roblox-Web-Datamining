import { addExternal, addLegacyExternal } from "@rbx/externals";
import * as realtime from "@rbx/core-scripts/realtime";

addExternal(["Roblox", "core-scripts", "realtime"], realtime);

addLegacyExternal(["Roblox", "RealTime", "Factory"], realtime.default);
