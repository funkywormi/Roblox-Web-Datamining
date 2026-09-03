import { addExternal, addLegacyExternal } from "@rbx/externals";
import * as intl from "@rbx/core-scripts/intl";

addExternal(["Roblox", "core-scripts", "intl", "intl"], intl);

addLegacyExternal(["Roblox", "Intl"], intl.default);
