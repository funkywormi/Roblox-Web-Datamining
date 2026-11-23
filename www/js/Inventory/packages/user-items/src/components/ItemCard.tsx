import { Fragment } from "react";
import classNames from "classnames";
import { Thumbnail2d } from "@rbx/thumbnails";
import type { AssetItem } from "../constants/types";
import { useItemsTranslate } from "../hooks/useItemsTranslate";
import { shouldShowPremiumIcon, type LayoutData } from "../utils/itemPrice";
import ItemCardPrice from "./ItemCardPrice";

type ItemCardProps = {
  item: AssetItem;
  layoutData: LayoutData;
  isPlaceItem: boolean;
  showCreatorName: boolean;
  showOwnershipPreposition: boolean;
  onClick: (item: AssetItem) => void;
};

const ItemCard = ({
  item,
  layoutData,
  isPlaceItem,
  showCreatorName,
  showOwnershipPreposition,
  onClick,
}: ItemCardProps) => {
  const translate = useItemsTranslate();
  const assetRestrictionTag = item.AssetRestrictionIcon?.CssTag;
  const serialNumber = item.Product?.SerialNumber;
  const serialNumberLabel = serialNumber ? `#${serialNumber}` : null;

  return (
    <li className={classNames("list-item item-card", { "place-item": isPlaceItem })}>
      <div className="item-card-container">
        <a
          href={item.Item?.AbsoluteUrl}
          className="item-card-link"
          onClick={() => {
            onClick(item);
          }}
        >
          <div
            className={classNames("item-card-thumb-container", {
              "item-inactive": item.showInactiveTint,
            })}
          >
            {item.licenseBadge && (
              <div className="item-license-badge-container">
                <span
                  className={classNames(
                    "item-license-badge radius-circle text-label-small",
                    item.licenseBadge.className,
                  )}
                >
                  {translate(item.licenseBadge.labelKey)}
                </span>
              </div>
            )}
            {serialNumberLabel && <div className="item-serial-number">{serialNumberLabel}</div>}
            <span className="item-card-thumb">
              {item.itemV2?.id !== undefined && (
                <Thumbnail2d type={item.itemV2.thumbnail.type} targetId={item.itemV2.id} />
              )}
            </span>
            {item.itemRestrictionIcon && (
              <span className={classNames("restriction-icon", item.itemRestrictionIcon)} />
            )}
            {assetRestrictionTag && <span className={`icon-${assetRestrictionTag}-label`} />}
            {item.showUnavailableBadge && (
              <span className="item-unavailable-badge bg-system-alert text-label-small">
                {translate("Label.Unavailable")}
              </span>
            )}
            {item.showExpiringBadge && (
              <span className="item-serial-number">{translate("Label.Expiring")}</span>
            )}
          </div>
          <div className="item-card-name" title={item.Item?.Name}>
            {shouldShowPremiumIcon(item, layoutData) && (
              <Fragment>
                <span className="icon-premium-small" />{" "}
              </Fragment>
            )}
            <span>{item.Item?.Name}</span>
          </div>
        </a>
        {item.Item?.AudioUrl && (
          <div className="MediaPlayerControls">
            <div className="MediaPlayerIcon icon-play" data-mediathumb-url={item.Item.AudioUrl} />
          </div>
        )}
        {showCreatorName && item.Creator && !item.itemDetailsLoading && (
          <div className="text-overflow item-card-label">
            {showOwnershipPreposition && (
              <Fragment>
                <span>{translate("Label.OwnershipPreposition")}</span>{" "}
              </Fragment>
            )}
            <a
              className="creator-name text-overflow text-link"
              href={item.Creator.CreatorProfileLink}
            >
              {item.Creator.nameForDisplay}
            </a>
          </div>
        )}
        {!item.itemDetailsLoading && !item.hidePrice && (
          <ItemCardPrice item={item} layoutData={layoutData} />
        )}
        {item.itemDetailsLoading && (
          <ul className="item-card-caption-progressive-loading shimmer-lines">
            <li className="placeholder shimmer-line" />
            <li className="placeholder shimmer-line" />
            <li className="placeholder shimmer-line" />
          </ul>
        )}
      </div>
    </li>
  );
};

export default ItemCard;
