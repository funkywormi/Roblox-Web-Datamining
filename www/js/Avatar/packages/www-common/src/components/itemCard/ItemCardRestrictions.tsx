import type { JSX } from "react";
import { clsx } from "@rbx/foundation-ui";
import { getRestrictionIconClassName } from "./restrictionIcon";
import { mapItemRestrictionIcons } from "./utils";

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
  const iconClassName = getRestrictionIconClassName(itemRestrictionIcon);
  if (!iconClassName) {
    return null;
  }
  return <span className={clsx("www-item-card-restriction", iconClassName)} />;
}

export default ItemCardRestrictions;
