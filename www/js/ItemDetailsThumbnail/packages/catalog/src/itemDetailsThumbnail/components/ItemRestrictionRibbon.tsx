import React from "react";
import { ItemCardRestrictions } from "react-style-guide";

export function ItemRestrictionRibbon({
  itemRestrictions,
}: {
  itemRestrictions: ItemCardRestrictions;
}): JSX.Element {
  return (
    <div>
      {itemRestrictions.itemRestrictionIcon !== undefined && (
        <span className={`restriction-icon ${itemRestrictions.itemRestrictionIcon}`} />
      )}
    </div>
  );
}

export default ItemRestrictionRibbon;
