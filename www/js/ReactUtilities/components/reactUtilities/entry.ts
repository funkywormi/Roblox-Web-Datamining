import * as RadixUiDismissableLayer from "@radix-ui/react-dismissable-layer";
import * as RadixUiFocusGuards from "@radix-ui/react-focus-guards";
import { addExternal } from "@rbx/externals";
import * as reactUtil from "@rbx/core-scripts/react";
import * as ReactUtilities from "@rbx/core-scripts/legacy/react-utilities";

addExternal(["Roblox", "core-scripts", "react"], reactUtil);

addExternal("ReactUtilities", { ...ReactUtilities });

addExternal(["RadixUI", "react-dismissable-layer"], RadixUiDismissableLayer);
addExternal(["RadixUI", "react-focus-guards"], RadixUiFocusGuards);
