import type { JSX, ReactElement } from "react";
import ItemCardStatus from "./ItemCardStatus";
import ItemCardRestrictions from "./ItemCardRestrictions";
import type { ItemCardTranslate } from "./types";

function ItemCardThumbnail({
  itemType,
  itemStatus,
  itemRestrictions,
  thumbnail2d,
  translate,
}: {
  itemType: string;
  itemStatus: string[] | undefined;
  itemRestrictions: string[] | undefined;
  thumbnail2d: ReactElement;
  translate: ItemCardTranslate;
}): JSX.Element {
  return (
    <div className="relative aspect-1-1 clip radius-medium bg-surface-100">
      <div className="size-full">{thumbnail2d}</div>
      <ItemCardStatus itemStatus={itemStatus} translate={translate} />
      <ItemCardRestrictions type={itemType} itemRestrictions={itemRestrictions} />
    </div>
  );
}

export default ItemCardThumbnail;
