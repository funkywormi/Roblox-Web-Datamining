import { JSX } from "react";
import { mapItemRestrictionIcons } from "../utils";

function ItemCardRestrictions({
  type,
  itemRestrictions,
}: {
  type: string;
  itemRestrictions: string[] | undefined;
}): JSX.Element | null {
  const itemRestrictionLabels = mapItemRestrictionIcons(itemRestrictions, type);
  return itemRestrictions?.length ? (
    <span className={`restriction-icon ${itemRestrictionLabels.itemRestrictionIcon}`} />
  ) : null;
}

export default ItemCardRestrictions;
