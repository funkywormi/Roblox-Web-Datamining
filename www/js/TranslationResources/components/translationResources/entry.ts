import { addExternal, addLegacyExternal } from "@rbx/externals";
import * as translation from "@rbx/core-scripts/intl/translation";

addExternal(["Roblox", "core-scripts", "intl", "translation"], translation);

addLegacyExternal(
  ["Roblox", "TranslationResourceProvider"],
  translation.TranslationResourceProvider,
);
