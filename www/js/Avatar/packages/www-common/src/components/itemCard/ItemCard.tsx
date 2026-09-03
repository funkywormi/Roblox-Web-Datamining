import type { JSX } from "react";
import { clsx } from "@rbx/foundation-ui";
import ItemCardThumbnail from "./ItemCardThumbnail";
import ItemCardCaption from "./ItemCardCaption";
import { getItemLink } from "./utils";
import type { ItemCardProps } from "./types";
import "./itemCard.css";

/**
 * Foundation-UI, SCSS-free item card. Dual-target: renders in the .NET SCC and the
 * Next.js app. Styling uses Foundation Tailwind tokens; the caller supplies a
 * `translate` (see {@link ItemCardProps}) so the card carries no i18n framework.
 */
function ItemCard({
  id,
  name,
  type,
  creatorName,
  creatorType,
  creatorTargetId,
  price,
  lowestPrice,
  priceStatus,
  premiumPricing,
  itemStatus,
  itemRestrictions,
  thumbnail2d,
  iconToRender,
  containerClassName,
  isPremiumUser = false,
  translate,
}: ItemCardProps): JSX.Element {
  return (
    <div
      className={clsx(
        "www-item-card grow-1 shrink-1 basis-0 min-width-0 padding-xsmall",
        containerClassName,
      )}
    >
      <a
        href={getItemLink(id, name, type)}
        target="_self"
        className="flex flex-col gap-xsmall no-underline content-emphasis"
      >
        <ItemCardThumbnail
          itemType={type}
          itemStatus={itemStatus}
          itemRestrictions={itemRestrictions}
          thumbnail2d={thumbnail2d}
          translate={translate}
        />
        <ItemCardCaption
          name={name}
          creatorName={creatorName}
          creatorType={creatorType}
          creatorTargetId={creatorTargetId}
          price={price}
          lowestPrice={lowestPrice}
          priceStatus={priceStatus}
          premiumPricing={premiumPricing}
          isPremiumUser={isPremiumUser}
          iconToRender={iconToRender}
          translate={translate}
        />
      </a>
    </div>
  );
}

export default ItemCard;
