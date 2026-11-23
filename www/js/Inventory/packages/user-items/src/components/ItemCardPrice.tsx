import { Fragment } from "react";
import classNames from "classnames";
import { useLocale } from "@rbx/www-common/i18n";
import type { AssetItem } from "../constants/types";
import { useItemsTranslate } from "../hooks/useItemsTranslate";
import abbreviate from "../utils/abbreviate";
import { getDisplayPrice, getItemPriceDisplay, type LayoutData } from "../utils/itemPrice";

type ItemCardPriceProps = {
  item: AssetItem;
  layoutData: LayoutData;
};

export const formatExpiresOnDate = (expirationTime: string, locale: string): string => {
  try {
    return new Intl.DateTimeFormat(locale, { month: "short", day: "numeric" }).format(
      new Date(expirationTime),
    );
  } catch {
    return "";
  }
};

const PrivateServerPriceLine = ({ item }: { item: AssetItem }) => {
  const translate = useItemsTranslate();
  const locale = useLocale();
  const priceLine = item.privateServerPriceLine;

  let content = null;
  switch (priceLine?.kind) {
    case "inactive":
      content = <span>{translate("Label.Inactive")}</span>;
      break;
    case "expiring":
      content = (
        <span>
          {translate("Label.ExpiresOnDate", {
            date: formatExpiresOnDate(priceLine.expirationTime, locale),
          })}
        </span>
      );
      break;
    case "freeWithPlus":
      content = (
        <span>
          <span className="icon icon-regular-roblox-plus item-plus-icon" aria-hidden="true" />{" "}
          <span>{translate("Action.FreeWithBlackbird")}</span>
        </span>
      );
      break;
    case "price":
      content = (
        <span>
          {priceLine.originalPriceInRobux ? (
            <span className="text-secondary item-price-struck">
              <span className="icon-robux-16x16" />{" "}
              <span>
                {translate("Label.PerMonthAbbv", {
                  price: String(abbreviate(priceLine.originalPriceInRobux)),
                })}
              </span>
            </span>
          ) : (
            <span className="icon-robux-16x16" />
          )}{" "}
          <span>
            {translate("Label.PerMonthAbbv", {
              price: String(abbreviate(priceLine.priceInRobux)),
            })}
          </span>
        </span>
      );
      break;
    case undefined:
    default:
      break;
  }

  return (
    <span className="text-label">
      <span className="text-overflow font-caption-body text-robux-tile">{content}</span>
    </span>
  );
};

const ItemCardPrice = ({ item, layoutData }: ItemCardPriceProps) => {
  const translate = useItemsTranslate();
  const priceDisplay = getItemPriceDisplay(item, layoutData);
  const labelClassName = classNames("text-overflow font-caption-body", {
    "text-robux-tile": item.Product?.IsFree,
  });

  return (
    <div className="text-overflow item-card-price">
      {priceDisplay === "privateServerPrice" && <PrivateServerPriceLine item={item} />}
      {priceDisplay === "noPriceText" && (
        <span className="text-label">
          <span className={labelClassName}>{item.Product?.NoPriceText}</span>
        </span>
      )}
      {priceDisplay === "priceStatus" && (
        <span className="text-label">
          <span className={labelClassName}>{item.priceStatus}</span>
        </span>
      )}
      {priceDisplay === "free" && (
        <span className="text-label">
          <span className={labelClassName}>{translate("Label.Free")}</span>
        </span>
      )}
      {priceDisplay === "price" && (
        <Fragment>
          <span className="icon-robux-16x16" />{" "}
          <span className="text-robux-tile">{abbreviate(getDisplayPrice(item, layoutData))}</span>
        </Fragment>
      )}
      {priceDisplay === "offsale" && (
        <span className="text-label">
          <span className={labelClassName}>{translate("Label.Offsale")}</span>
        </span>
      )}
    </div>
  );
};

export default ItemCardPrice;
