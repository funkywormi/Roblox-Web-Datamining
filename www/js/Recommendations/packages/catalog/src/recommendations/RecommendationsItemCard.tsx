import React from "react";
import classNames from "classnames";
import { Thumbnail2d } from "@rbx/thumbnails";
import { abbreviateNumber } from "@rbx/core-scripts/format/number";
import type { TranslateFunction } from "@rbx/core-scripts/react";
// Type-only: a value import evaluates RecommendationsService, whose EnvironmentUrls read throws on a
// non-Roblox host.
import type { RecommendedItem } from "./RecommendationsService";

export type RecommendationsItemCardProps = {
  item: RecommendedItem;
  translate: TranslateFunction;
  isPremiumIconOnItemTilesEnabled?: boolean;
  isPremiumPriceOnItemTilesEnabled?: boolean;
};

const premiumPriceOf = (item: RecommendedItem) =>
  "premiumPrice" in item ? item.premiumPrice : undefined;

const doesItemHavePremiumPrice = (item: RecommendedItem) => {
  const premiumPrice = premiumPriceOf(item);
  return premiumPrice !== undefined && premiumPrice !== null;
};

const getDisplayPrice = (item: RecommendedItem, isPremiumPriceEnabled: boolean) => {
  if (isPremiumPriceEnabled && doesItemHavePremiumPrice(item)) {
    return premiumPriceOf(item);
  }
  if (item.lowestPrice) {
    return item.lowestPrice;
  }
  return item.price;
};

const isNotExperienceOnlySaleLocationWithNoResellers = (item: RecommendedItem) =>
  ("saleLocationType" in item ? item.saleLocationType : undefined) !== "ExperiencesDevApiOnly" ||
  ("hasResellers" in item ? item.hasResellers : false);

const RecommendationsItemCard = ({
  item,
  translate,
  isPremiumIconOnItemTilesEnabled = false,
  isPremiumPriceOnItemTilesEnabled = false,
}: RecommendationsItemCardProps): JSX.Element => {
  const displayPrice = getDisplayPrice(item, isPremiumPriceOnItemTilesEnabled);
  const saleable = isNotExperienceOnlySaleLocationWithNoResellers(item);
  const showRobuxIcon = saleable && Boolean(displayPrice || item.lowestPrice);
  const showDisplayPrice = saleable && Boolean(displayPrice) && !item.lowestPrice;
  const showLowestPrice = saleable && Boolean(item.lowestPrice);
  const showPremiumIcon = isPremiumIconOnItemTilesEnabled && doesItemHavePremiumPrice(item);

  return (
    <div className="item-card-container recommended-item-link">
      <a href={item.absoluteUrl} className="item-card-link">
        <div className="item-card-thumb-container">
          <Thumbnail2d
            containerClass="item-card-thumb"
            type={item.thumbnail.type}
            targetId={item.id}
          />
          <span
            className={classNames("restriction-icon", item.itemRestrictionIcon)}
            style={item.itemRestrictionIcon ? undefined : { display: "none" }}
          />
        </div>
        <div className="item-card-name recommended-name" title={item.name}>
          {showPremiumIcon && <span className="icon-premium-small" />}
          <span>{item.name}</span>
        </div>
      </a>
      {item.audioUrl && (
        <div className="MediaPlayerControls">
          <div className="MediaPlayerIcon icon-play" data-mediathumb-url={item.audioUrl} />
        </div>
      )}
      <div className="recommended-creator-container">
        {item.creator && (
          <div className="text-overflow item-card-creator recommended-creator">
            <span
              className="text-overflow"
              // The resource embeds the anchor, so the link cannot be JSX without reordering copy.
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{
                __html: translate("Label.ByCreatorLink", {
                  linkStart: `<a target=_self class='creator-name text-link' href='${item.creator.profileLink}'>`,
                  linkEnd: "</a>",
                  creator: item.creator.nameForDisplay,
                }),
              }}
            />
          </div>
        )}
        {item.creatorHasVerifiedBadge && (
          <span
            className="verified-badge-icon-item-recommendations"
            data-size="Title"
            data-overrideimgclass="verified-badge-icon-item-recommendations-rendered"
          />
        )}
      </div>
      <div className="text-overflow item-card-price">
        <span
          className="icon-robux-16x16"
          style={showRobuxIcon ? undefined : { display: "none" }}
        />
        <span
          className="text-robux-tile"
          style={showDisplayPrice ? undefined : { display: "none" }}
        >
          {displayPrice ? abbreviateNumber(displayPrice) : ""}
        </span>
        <span className="text-robux-tile" style={showLowestPrice ? undefined : { display: "none" }}>
          {item.lowestPrice ? abbreviateNumber(item.lowestPrice) : ""}
        </span>
        <h4 className="text text-label" style={showRobuxIcon ? { display: "none" } : undefined}>
          {item.product.noPriceText.length > 0 && (
            <span
              className={classNames("text-overflow", "font-caption-body", {
                "text-robux-tile": item.product.isFree,
              })}
            >
              {item.product.noPriceText}
            </span>
          )}
        </h4>
      </div>
    </div>
  );
};

export default RecommendationsItemCard;
