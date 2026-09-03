import { addExternal, addLegacyExternal } from "@rbx/externals";
import * as environmentUrls from "./src";

addExternal(["Roblox", "core-scripts", "environmentUrls"], environmentUrls);

addLegacyExternal(["Roblox", "EnvironmentUrls"], environmentUrls.default);
