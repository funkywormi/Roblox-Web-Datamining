import { addExternal, addLegacyExternal } from "@rbx/externals";
// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import * as webBlox from "@rbx/ui";

addExternal(["Roblox", "ui"], webBlox);

addLegacyExternal("WebBlox", webBlox);
