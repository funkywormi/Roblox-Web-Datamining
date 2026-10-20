import { addExternal } from "@rbx/externals";
import * as colorMode from "@rbx/core-scripts/color-mode";
import { initialize } from "@rbx/core-scripts/color-mode/internal";
import { parseUserId } from "@rbx/www-common/user";

addExternal(["Roblox", "core-scripts", "color-mode"], colorMode);

const userId = () => {
  const s = document.querySelector<HTMLMetaElement>('meta[name="user-data"]')?.dataset.userid;
  return s == null ? null : parseUserId(s);
};

const getDefaultColorMode = () => {
  const meta = document.querySelector<HTMLMetaElement>('meta[name="age-badge-control"]');
  return meta?.dataset.ageBadgeControl === "Kids" ? "dark" : undefined;
};

try {
  const defaultColorMode = getDefaultColorMode();
  initialize(userId(), { defaultColorMode });
} catch (e) {
  console.error(e);
}
