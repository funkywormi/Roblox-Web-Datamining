import React from "react";
import classNames from "classnames";
import { useTranslation } from "@rbx/core-scripts/react";
import RecommendationsItemCard from "./RecommendationsItemCard";
// Type-only: a value import evaluates RecommendationsService, whose EnvironmentUrls read throws on a
// non-Roblox host.
import type { RecommendedItem } from "./RecommendationsService";

export type RecommendationsCarouselProps = {
  items: RecommendedItem[];
  showSeeAllButton: boolean;
  seeAllHref?: string;
  singleRow: boolean;
  moreByCreatorEnabled: boolean;
  complimentary: { enabled: boolean; targetId?: number; isBundle: boolean };
  displayCount?: number;
  listRef?: React.Ref<HTMLUListElement>;
  // The metadata count, not items.length.
  numberOfItems?: number;
  isPremiumIconOnItemTilesEnabled?: boolean;
  isPremiumPriceOnItemTilesEnabled?: boolean;
};

const RecommendationsCarousel = ({
  items,
  showSeeAllButton,
  seeAllHref,
  singleRow,
  moreByCreatorEnabled,
  complimentary,
  displayCount,
  listRef,
  numberOfItems,
  isPremiumIconOnItemTilesEnabled,
  isPremiumPriceOnItemTilesEnabled,
}: RecommendationsCarouselProps): JSX.Element => {
  const { translate } = useTranslation();

  return (
    <div>
      <div
        id="complimentary-items-recommendations-container"
        data-target-id={complimentary.targetId}
        data-is-bundle={complimentary.isBundle}
      />
      {complimentary.enabled && <div className="complimentary-items-divider" />}
      {/* ng-show, not ng-if: stays mounted when empty. */}
      <div className="current-items" style={items.length > 0 ? undefined : { display: "none" }}>
        <div className="container-list layer recommendations-container">
          <div className="container-header recommendations-header">
            <h2>
              <span>{translate("Heading.RecommendedTitle")}</span>
            </h2>
            {showSeeAllButton && (
              <a className="see-all-button see-all-link-icon btn-secondary-xs" href={seeAllHref}>
                {translate("Action.SeeAll")}
              </a>
            )}
          </div>
          <div className="recommended-items-slider">
            <ul
              ref={listRef}
              className={classNames("hlist", "item-cards", "recommended-items", {
                "item-cards-embed": (numberOfItems ?? 0) < 7,
                "single-row": singleRow,
              })}
            >
              {(displayCount ? items.slice(0, displayCount) : items).map(
                (item: RecommendedItem) => {
                  return (
                    <li key={item.id} className="list-item item-card recommended-item">
                      <RecommendationsItemCard
                        item={item}
                        translate={translate}
                        isPremiumIconOnItemTilesEnabled={isPremiumIconOnItemTilesEnabled}
                        isPremiumPriceOnItemTilesEnabled={isPremiumPriceOnItemTilesEnabled}
                      />
                    </li>
                  );
                },
              )}
            </ul>
          </div>
        </div>
      </div>
      {moreByCreatorEnabled && <div className="item-list" />}
    </div>
  );
};

export default RecommendationsCarousel;
