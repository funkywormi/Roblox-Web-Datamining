import { addExternal } from "@rbx/externals";
import * as mode from "@rbx/core-scripts/color-mode";
import { initialize } from "@rbx/core-scripts/color-mode/internal";

addExternal(["Roblox", "core-scripts", "color-mode"], mode);

const userId = (): number | null => {
  const id = document.querySelector<HTMLMetaElement>('meta[name="user-data"]')?.dataset.userid;
  if (id == null) {
    return null;
  }
  const userId = Number.parseInt(id, 10);
  return Number.isNaN(userId) ? null : userId;
};

const getDefaultMode = (): mode.Mode | undefined => {
  const meta = document.querySelector<HTMLMetaElement>('meta[name="age-badge-control"]');
  return meta?.dataset.ageBadgeControl === "Kids" ? "dark" : undefined;
};

try {
  const defaultMode = getDefaultMode();
  initialize(userId() ?? -1, { defaultMode });
} catch (e) {
  console.error(e);
}
