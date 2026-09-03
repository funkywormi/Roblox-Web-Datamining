import React from "react";
import { useTranslation } from "@rbx/core-scripts/react";
import { Tooltip, TooltipTrigger } from "@rbx/foundation-ui";
import { ItemCard } from "@rbx/core-ui";
// The `ReactStyleGuide` external exposes these utils as `ItemCardUtils`; the
// `@rbx/core-ui` barrel's `itemCardUtils` has no runtime counterpart on it.
import { ItemCardUtils } from "@rbx/core-ui/legacy/react-style-guide";
import { Thumbnail2d, ThumbnailTypes, DefaultThumbnailSize } from "@rbx/thumbnails";
import { TradableItem } from "../types";
import { renderSerialTooltip } from "../utils/tradesUtils";

export type TradeItemCardProps = {
  item: TradableItem;
  /**
   * Optional content layered over the thumbnail (e.g. the selection / on-hold
   * overlay). Rendered inside the ItemCard's `.item-card-thumb-container`, which
   * is `position: relative`, so an `inset: 0` overlay lines up exactly with the
   * thumbnail image.
   */
  overlay?: React.ReactNode;
};

/**
 * Renders a single tradable item using the shared catalog ItemCard component
 * (per design guidance) instead of the legacy Angular trade-item-card directive.
 */
export const TradeItemCard = ({ item, overlay }: TradeItemCardProps): JSX.Element => {
  const { translate } = useTranslation();
  const { itemType } = item.itemTarget;
  const isBundle = ItemCardUtils.checkIfBundle(itemType);

  // Limited / serial-number badge over the thumbnail (port of the Angular
  // `limited-icon` directive + populateLayoutOptions). The shop-limited icon
  // shows for every tradable item; serialized items show `#<serialNumber>` inline
  // by default. On hover the visible number collapses (`display: none`, so the
  // badge background shrinks to just the star — no leftover blank spot) and the
  // full text moves into the tooltip — `#1234/45678` for serialized items,
  // `Serial N/A /45678` for non-serialized limiteds.
  //
  // The tooltip trigger is a separate, invisible hover target (`.limited-hover-
  // target`) layered over the badge: it mirrors the badge content but is
  // transparent and absolutely positioned, so it keeps the full (expanded)
  // footprint even while the visible number collapses. The pointer therefore
  // never lands on shrinking geometry, so the badge can't flicker on hover. The
  // tooltip layers above the badge via `.trade-serial-tooltip` (higher z-index).
  const isUnique = item.serialNumber != null;
  const tooltipText = renderSerialTooltip(item, translate);
  const renderBadgeContent = (): JSX.Element => (
    <React.Fragment>
      <span className="icon-shop-limited" />
      {isUnique && (
        <span className="limited-number-container">
          <span className="font-caption-header">#</span>
          <span className="font-caption-header text-subheader limited-number">
            {item.serialNumber}
          </span>
        </span>
      )}
    </React.Fragment>
  );
  const limitedIcon = tooltipText ? (
    <Tooltip
      position="top-center"
      delayDurationMs={0}
      contentClassName="trade-serial-tooltip"
      title={tooltipText}
    >
      <span className="limited-icon-container">
        {renderBadgeContent()}
        <TooltipTrigger asChild>
          <span className="limited-hover-target" aria-hidden="true">
            {renderBadgeContent()}
          </span>
        </TooltipTrigger>
      </span>
    </Tooltip>
  ) : (
    <span className="limited-icon-container">{renderBadgeContent()}</span>
  );

  return (
    <ItemCard
      id={item.itemTarget.targetId}
      name={item.itemName}
      type={itemType}
      // @ts-expect-error TODO: old, migrated code
      creatorName={undefined}
      creatorType=""
      creatorTargetId={0}
      price={item.recentAveragePrice}
      lowestPrice={undefined}
      priceStatus={undefined}
      premiumPricing={undefined}
      unitsAvailableForConsumption={undefined}
      itemStatus={undefined}
      itemRestrictions={undefined}
      thumbnail2d={
        <React.Fragment>
          <Thumbnail2d
            type={isBundle ? ThumbnailTypes.bundleThumbnail : ThumbnailTypes.assetThumbnail}
            targetId={item.itemTarget.targetId}
            size={DefaultThumbnailSize}
          />
          {limitedIcon}
          {overlay}
        </React.Fragment>
      }
    />
  );
};

export default TradeItemCard;
