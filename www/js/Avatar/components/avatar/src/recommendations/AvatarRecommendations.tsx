import React, { useEffect, useRef, useState } from "react";
import classNames from "classnames";
import { ItemCard, checkIfBundle } from "@rbx/www-common/components/itemCard";
import { getAbsoluteUrl } from "@rbx/core-scripts/endpoints";
import VerifiedBadgeIcon from "@rbx/www-common/components/verified-badge";
import { Thumbnail2d, ThumbnailTypes } from "@rbx/thumbnails";
import { useTranslation } from "@rbx/core-scripts/react";
import RecommendationsService, {
  CatalogMetadata,
  RecommendationsMetadata,
  RecommendedItem,
} from "./RecommendationsService";
import {
  complimentaryItemRecommendationsSupportedPages,
  itemTypes,
  seeAllRecommendationLinks,
  urls,
} from "../constants/recommendationsConstants";
import getABTestEnrollment from "./getABTestEnrollment";
import experimentConstants from "./experimentConstants";
import { useAvatarColumns, MAX_AVATAR_COLUMNS } from "../hooks";
import { trackAvatarEditorClick, AvatarEditorTrackingEvents } from "../utils/axTracking";

type AvatarRecommendationsProps = {
  recommendationType: number;
  recommendationSubtype: number;
  pageName: string;
  showSeeAllButton: boolean;
};

export type RecommendationsData = {
  hideRecommendations?: boolean;
  recommendationType: number;
  recommendationSubtype: number;
};

type ComplimentaryItemRecommendationsType = {
  enabled: boolean;
  targetId: number | undefined;
  isBundle: boolean;
  displayPurchaseButtonLeft: boolean;
};

type Library = {
  currentPageName: string | null;
  isMetaDataLoaded: boolean;
  isPremiumPriceOnItemTilesEnabled?: boolean;
  isPremiumIconOnItemTilesEnabled?: boolean;
};

const AvatarRecommendations: React.FC<AvatarRecommendationsProps> = ({
  recommendationType,
  recommendationSubtype,
  pageName,
  showSeeAllButton,
}) => {
  const { translate } = useTranslation();
  const [items, setItems] = useState<RecommendedItem[]>([]);
  // Display exactly one row sized to the editor's current column count (5/6/7),
  // while prefetching enough to fill the widest layout so resizing up never under-fills.
  const columns = useAvatarColumns();
  const [recommendationNumRows, setRecommendationNumRows] = useState(1);
  const [absoluteCatalogUrl, setAbsoluteCatalogUrl] = useState("");
  const [isMoreByCreatorEnabled, setIsMoreByCreatorEnabled] = useState(false);
  const [complimentaryItemRecommendations, setComplimentaryItemRecommendations] =
    useState<ComplimentaryItemRecommendationsType>({
      enabled: false,
      targetId: undefined,
      isBundle: false,
      displayPurchaseButtonLeft: false,
    });
  const [library, setLibrary] = useState<Library>({
    currentPageName: null,
    isMetaDataLoaded: false,
  });

  const [numberOfItems, setNumberOfItems] = useState<number>(0);
  const [subject, setSubject] = useState<string>("");
  const initialRecommendationTargetId = 0;

  const clearItems = () => {
    setItems([]);
  };

  const getItems = (recommendationsSubject: string) => {
    const type = recommendationType;
    const subtype = recommendationSubtype;

    // Prefetch enough to fill the widest layout (max columns); the render slices
    // down to the current column count so a single row is always fully populated.
    RecommendationsService.beginUpdateRecommendedItems(
      0,
      type,
      subtype,
      MAX_AVATAR_COLUMNS,
      recommendationsSubject,
    ).then(
      (result: any[]) => {
        setItems(result);
      },
      () => {
        console.debug(" ------ beginUpdateRecommendedItems error -------");
      },
    );
  };

  const renderComplimentaryItems = () => {
    window.dispatchEvent(
      new CustomEvent("complimentary-items:render", {
        detail: {
          targetId: complimentaryItemRecommendations.targetId,
          isBundle: complimentaryItemRecommendations.isBundle,
          displayPurchaseButtonLeft: complimentaryItemRecommendations.displayPurchaseButtonLeft,
        },
      }),
    );
  };

  const getComplimentaryItemRecommendationsEnrollment = () => {
    if (!complimentaryItemRecommendationsSupportedPages.includes(pageName)) {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    getABTestEnrollment(
      experimentConstants.defaultProjectId,
      experimentConstants.layerNames.avatarShopRecommendationsAndSearchWeb,
      experimentConstants.parameterNames.complimentaryItemRecommendationsEnabled,
    ).then((result: any) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (result?.complimentaryItemRecommendationsEnabled !== undefined) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const enabled = result.complimentaryItemRecommendationsEnabled as boolean;
        if (enabled) {
          const isBundle = subject === itemTypes.bundle;
          setComplimentaryItemRecommendations({
            enabled,
            targetId: initialRecommendationTargetId,
            isBundle,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            displayPurchaseButtonLeft: result.displayPurchaseButtonLeft as boolean,
          });
          renderComplimentaryItems();
        }
      }
    });
  };

  const getAvatarMarketplaceRelevanceRecommendationsEnrollment = () => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    getABTestEnrollment(
      experimentConstants.defaultProjectId,
      experimentConstants.layerNames.avatarMarketplaceRelevanceRecommendations,
      experimentConstants.parameterNames.avatarMarketplaceRelevanceRecommendations,
    );
  };

  const initRecommendations = () => {
    // RecommendationsService.overrideRecommendationTypes(recommendationItemtypes);

    if (RecommendationsService.isRecommendationAllowed(recommendationType, recommendationSubtype)) {
      if (library.currentPageName !== pageName) {
        setAbsoluteCatalogUrl(getAbsoluteUrl(urls.catalog));
        if (!initialRecommendationTargetId) {
          // initialRecommendationTargetId = 0;
        }
        setLibrary(prev => {
          return {
            ...prev,
            currentPageName: pageName,
          };
        });

        RecommendationsService.getRecommendationMetadata(pageName).then(
          (recommendationsMetadata: RecommendationsMetadata) => {
            const adjustedNumberOfItems = recommendationsMetadata.numberOfItems;
            setNumberOfItems(adjustedNumberOfItems);
            setSubject(recommendationsMetadata.subject);
            RecommendationsService.getCatalogMetadata().then(
              (catalogMetadata: CatalogMetadata) => {
                setLibrary(prev => ({
                  ...prev,
                  isPremiumIconOnItemTilesEnabled: catalogMetadata.isPremiumIconOnItemTilesEnabled,
                  isPremiumPriceOnItemTilesEnabled:
                    catalogMetadata.isPremiumPriceOnItemTilesEnabled,
                  isMetaDataLoaded: true,
                }));

                getComplimentaryItemRecommendationsEnrollment();
                getAvatarMarketplaceRelevanceRecommendationsEnrollment();

                if (adjustedNumberOfItems) {
                  getABTestEnrollment(
                    experimentConstants.defaultProjectId,
                    experimentConstants.layerNames.avatarShopPage,
                    experimentConstants.parameterNames.recommendationNumRows,
                  )
                    .then((result: any) => {
                      if (
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
                        result?.recommendationPageName?.includes(pageName) &&
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                        result?.recommendationNumRows
                      ) {
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                        setRecommendationNumRows(result.recommendationNumRows);
                      }
                    })
                    .finally(() => {
                      getItems(recommendationsMetadata.subject);
                    });
                }
              },
              () => {
                console.debug(" ------ getCatalogMetadata error -------");
              },
            );
          },
          () => {
            console.debug(" ------ getRecommendationsMetadata error -------");
          },
        );
      } else if (library.isMetaDataLoaded && numberOfItems) {
        getItems(subject);
      }
    } else {
      clearItems();
    }
  };

  useEffect(() => {
    initRecommendations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    clearItems();
    initRecommendations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recommendationType, recommendationSubtype]);

  // Recommendation cards (www-common ItemCard) navigate via an inner anchor and
  // expose no click callback, so we observe clicks via delegation on the list
  // and resolve which card was clicked to attach its position + item metadata.
  // A native listener is used (instead of an onClick prop on the non-interactive
  // <ul>) to keep accessibility semantics clean.
  const recommendedItemsRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const list = recommendedItemsRef.current;
    if (!list) {
      return undefined;
    }
    const onCardClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const card = target.closest(".item-card");
      if (!card) {
        return;
      }
      const cards = [...list.querySelectorAll(".item-card")];
      const position = cards.indexOf(card);
      const clickedItem = position >= 0 ? items[position] : undefined;
      trackAvatarEditorClick(AvatarEditorTrackingEvents.RecommendationClick, {
        recommendationType,
        recommendationSubtype,
        position,
        itemId: clickedItem?.id,
        itemType: clickedItem?.itemType,
      });
    };
    list.addEventListener("click", onCardClick);
    return () => {
      list.removeEventListener("click", onCardClick);
    };
  }, [items, recommendationType, recommendationSubtype]);

  const getSeeAllLink = () => {
    const type = recommendationType || 0;
    if (seeAllRecommendationLinks[type as 0 | 2]?.[recommendationSubtype]) {
      return seeAllRecommendationLinks[type as 0 | 2][recommendationSubtype];
    }
    return absoluteCatalogUrl;
  };

  return (
    <div>
      <div
        id="complimentary-items-recommendations-container"
        data-target-id={complimentaryItemRecommendations.targetId}
        data-is-bundle={complimentaryItemRecommendations.isBundle}
      />
      {complimentaryItemRecommendations.enabled && <div className="complimentary-items-divider" />}
      {items.length > 0 && (
        <div className="container-list layer recommendations-container">
          <div className="container-header recommendations-header">
            <h2>
              <span>{translate("Heading.RecommendedTitle")}</span>
            </h2>
            {showSeeAllButton && (
              <a
                className="see-all-button see-all-link-icon btn-secondary-xs"
                href={getSeeAllLink()}
              >
                {translate("Action.SeeAll")}
              </a>
            )}
          </div>
          <div className="recommended-items-slider">
            <ul
              ref={recommendedItemsRef}
              className={classNames("hlist", "item-cards", "recommended-items", {
                "single-row": recommendationNumRows <= 1,
              })}
            >
              {items.slice(0, columns).map((item: RecommendedItem) => {
                return (
                  <ItemCard
                    key={item.id}
                    // The www-common ItemCard renders `www-item-card` by default.
                    // Keep the legacy `item-card` class the recommendations column
                    // widths (avatar-non-fui.css) and the click-delegation analytics below
                    // both key off of.
                    containerClassName="item-card"
                    translate={translate}
                    id={item.id}
                    name={item.name}
                    type={item.itemType}
                    creatorName={item.creator.name}
                    creatorType={item.creator.type}
                    creatorTargetId={item.creator.id}
                    price={item.price}
                    lowestPrice={item.lowestPrice}
                    thumbnail2d={
                      <Thumbnail2d
                        type={
                          checkIfBundle(item.itemType)
                            ? ThumbnailTypes.bundleThumbnail
                            : ThumbnailTypes.assetThumbnail
                        }
                        targetId={item.id}
                      />
                    }
                    iconToRender={
                      item.creatorHasVerifiedBadge ? (
                        <VerifiedBadgeIcon
                          size="Small"
                          className="verified-badge-icon-catalog-item-rendered"
                          titleText={item.creator.id.toString()}
                        />
                      ) : undefined
                    }
                    itemRestrictions={item.itemRestrictions}
                    priceStatus={item.priceStatus}
                    premiumPricing={undefined}
                    unitsAvailableForConsumption={item.unitsAvailableForConsumption}
                    itemStatus={item.itemStatus}
                  />
                );
              })}
            </ul>
          </div>
        </div>
      )}
      {isMoreByCreatorEnabled && <div className="item-list" />}
    </div>
  );
};

export default AvatarRecommendations;
