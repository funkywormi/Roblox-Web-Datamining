import React from 'react';
import { TItemCardRestrictions } from 'react-style-guide';

export function ItemRestrictionRibbon({
  itemRestrictions
}: {
  itemRestrictions: TItemCardRestrictions;
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
