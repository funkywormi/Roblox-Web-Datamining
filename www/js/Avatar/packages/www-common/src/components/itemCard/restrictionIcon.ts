import { clsx } from "@rbx/foundation-ui";
import "./itemCard.css";

// Maps the legacy sprite class name to its namespaced CSS class (see itemCard.css).
// Only the two visible restriction glyphs are ported; everything else is
// intentionally empty (parity with core-ui, where the feature is disabled).
const spriteClassByIcon: Record<string, string | undefined> = {
  "icon-limited-label": "www-item-card-restriction-icon-limited",
  "icon-limited-unique-label": "www-item-card-restriction-icon-limited-unique",
};

// Classes that draw a legacy `itemRestrictionIcon` without the style guide, which Next.js doesn't load.
export const getRestrictionIconClassName = (
  itemRestrictionIcon: string | undefined,
): string | undefined => {
  const spriteClass = itemRestrictionIcon ? spriteClassByIcon[itemRestrictionIcon] : undefined;
  return spriteClass && clsx("www-item-card-restriction-icon", spriteClass);
};
