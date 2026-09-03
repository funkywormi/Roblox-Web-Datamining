import React, { JSX } from "react";
import { TranslateFunction } from "@rbx/core-scripts/react";
import { Badge } from "@rbx/foundation-ui";
import ItemCardStatus from "./ItemCardStatus";
import ItemCardRestrictions from "./ItemCardRestrictions";
import ItemCardPrice from "./ItemCardPrice";
import itemCardConstants from "../constants/itemCardConstants";
import { ItemCardShoppingCardProps, TTimedOption } from "../constants/itemCardTypes";

// Re-export for backward compatibility
export type { ItemCardShoppingCardProps };

export type ItemCardThumbnailProps = {
  itemId: number;
  itemType: string;
  itemName: string;
  itemStatus: string[] | undefined;
  itemRestrictions: string[] | undefined;
  thumbnail2d: React.ReactNode;
  translate: TranslateFunction;
  isHovered: boolean;
  shoppingCartProps?: ItemCardShoppingCardProps;
  price?: number;
  lowestPrice?: number;
  premiumPricing?: number;
  creatorTargetId: number;
  priceStatus?: string;
  unitsAvailableForConsumption?: number;
  enableThumbnailPrice?: boolean;
  timedOptions?: TTimedOption[] | undefined;
};

function ItemCardThumbnail({
  itemId,
  itemType,
  itemName,
  itemStatus,
  itemRestrictions,
  thumbnail2d,
  translate,
  isHovered,
  shoppingCartProps,
  premiumPricing,
  lowestPrice,
  price,
  enableThumbnailPrice,
  creatorTargetId,
  priceStatus,
  unitsAvailableForConsumption,
  timedOptions,
}: ItemCardThumbnailProps): JSX.Element {
  let shoppingCartButtons: JSX.Element | null = null;
  // Items that require Facial Age Estimation can't be added to the cart —
  // they go through the FAE unlock flow on the item details page instead, so
  // hide the add/remove buttons here.
  const isFaeItem = itemStatus?.includes(itemCardConstants.itemStatusTypes.IsFae) === true;
  if (shoppingCartProps && isHovered && !isFaeItem) {
    const { isItemInCart, addItemToCart, removeItemFromCart } = shoppingCartProps;
    shoppingCartButtons = (
      <React.Fragment>
        {!isItemInCart && (
          <div className="add-to-cart-btn-container">
            <button
              type="button"
              className="btn-primary-md add-to-cart"
              onClick={evt => {
                evt.preventDefault();
                evt.stopPropagation();

                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                addItemToCart({ itemId, itemType, itemName, timedOptions }, true);
              }}
            >
              {translate("Action.Add")}
            </button>
          </div>
        )}
        {isItemInCart && (
          <div className="add-to-cart-btn-container">
            <button
              type="button"
              className="btn-secondary-md remove-from-cart"
              onClick={evt => {
                evt.preventDefault();
                evt.stopPropagation();

                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                removeItemFromCart(itemId, itemType, true);
              }}
            >
              {translate("Action.Remove")}
            </button>
          </div>
        )}
      </React.Fragment>
    );
  }

  const selectedTimedOption = timedOptions?.find(option => option.selected);

  return (
    <div className="item-card-link">
      <div className="item-card-thumb-container">
        {timedOptions && timedOptions.length > 0 && (
          <div className="timed-options-container">
            <Badge
              variant="Neutral"
              icon="icon-regular-clock"
              className="bg-surface-0"
              label={
                selectedTimedOption?.days
                  ? translate("Label.TimedOptionDaysAbbreviation", {
                      days: selectedTimedOption.days,
                    })
                  : ""
              }
            />
          </div>
        )}
        {enableThumbnailPrice && (
          <ItemCardPrice
            price={price}
            creatorTargetId={creatorTargetId}
            lowestPrice={lowestPrice}
            priceStatus={priceStatus}
            premiumPricing={premiumPricing}
            unitsAvailableForConsumption={unitsAvailableForConsumption}
            enableThumbnailPrice={enableThumbnailPrice}
          />
        )}
        <div className="item-card-thumb-container-inner">{thumbnail2d}</div>
        <ItemCardStatus itemStatus={itemStatus} translate={translate} />
        <ItemCardRestrictions type={itemType} itemRestrictions={itemRestrictions} />

        {shoppingCartButtons}
      </div>
    </div>
  );
}

export default ItemCardThumbnail;
