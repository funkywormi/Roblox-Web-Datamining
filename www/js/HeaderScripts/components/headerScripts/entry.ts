import { addExternal, addLegacyExternal } from "@rbx/externals";
import * as device from "@rbx/core-scripts/meta/device";
import * as environment from "@rbx/core-scripts/meta/environment";
import * as user from "@rbx/core-scripts/meta/user";
import * as HeaderScripts from "@rbx/core-scripts/legacy/header-scripts";

addExternal(["Roblox", "core-scripts", "meta", "device"], device);
addExternal(["Roblox", "core-scripts", "meta", "environment"], environment);
addExternal(["Roblox", "core-scripts", "meta", "user"], user);

addExternal("HeaderScripts", { ...HeaderScripts });

// TODO: legacy global temporarily kept around. Remove after some time.
addLegacyExternal(["Roblox", "JsClientDeviceIdentifier"], HeaderScripts.jsClientDeviceIdentifier);
