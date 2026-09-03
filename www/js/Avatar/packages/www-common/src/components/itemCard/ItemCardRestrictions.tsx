import type { JSX } from "react";
import { clsx } from "@rbx/foundation-ui";
import { mapItemRestrictionIcons } from "./utils";

// Maps the legacy sprite class name to its namespaced CSS class (see itemCard.css).
// Only the two visible restriction glyphs are ported; everything else is
// intentionally empty (parity with core-ui, where the feature is disabled).
const spriteClassByIcon: Record<string, string | undefined> = {
  "icon-limited-label": "www-item-card-restriction-icon-limited",
  "icon-limited-unique-label": "www-item-card-restriction-icon-limited-unique",
};

function ItemCardRestrictions({
  type,
  itemRestrictions,
}: {
  type: string;
  itemRestrictions: string[] | undefined;
}): JSX.Element | null {
  if (!itemRestrictions?.length) {
    return null;
  }
  const { itemRestrictionIcon } = mapItemRestrictionIcons(itemRestrictions, type);
  const spriteClass = spriteClassByIcon[itemRestrictionIcon];
  if (!spriteClass) {
    return null;
  }
  return (
    <span
      className={clsx("www-item-card-restriction", "www-item-card-restriction-icon", spriteClass)}
    />
  );
}

export default ItemCardRestrictions;
