import React, { useEffect, useRef, useState } from "react";
import { getAbsoluteUrl } from "@rbx/core-scripts/endpoints";
import { useTranslation } from "@rbx/core-scripts/react";
import { initRobloxBadgesFrameworkAgnostic } from "roblox-badges";
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
} from "./recommendationsConstants";
import getABTestEnrollment from "./getABTestEnrollment";
import experimentConstants from "./experimentConstants";
import RecommendationsCarousel from "./RecommendationsCarousel";

type RecommendationsProps = {
  recommendationType: number;
  recommendationSubtype: number;
  pageName: string;
  showSeeAllButton: boolean;
  displayCount?: number;
  fetchCount?: number;
  onItemClick?: (detail: {
    recommendationType: number;
    recommendationSubtype: number;
    position: number;
    itemId?: number;
    itemType?: string;
  }) => void;
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

const Recommendations: React.FC<RecommendationsProps> = ({
  recommendationType,
  recommendationSubtype,
  pageName,
  showSeeAllButton,
  displayCount,
  fetchCount,
  onItemClick,
}) => {
  const { translate } = useTranslation();
  const [items, setItems] = useState<RecommendedItem[]>([]);
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

  // Swaps the badge span for the <img>; must run after the commit.
  useEffect(() => {
    try {
      initRobloxBadgesFrameworkAgnostic({
        overrideIconClass: "verified-badge-icon-item-recommendations",
      });
    } catch {
      // noop
    }
  }, [items]);

  const getItems = (recommendationsSubject: string, itemCount: number) => {
    const type = recommendationType;
    const subtype = recommendationSubtype;

    RecommendationsService.beginUpdateRecommendedItems(
      0,
      type,
      subtype,
      fetchCount ?? itemCount,
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
                  let resolvedNumRows = recommendationNumRows;
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
                        resolvedNumRows = result.recommendationNumRows as number;
                        setRecommendationNumRows(resolvedNumRows);
                      }
                    })
                    .finally(() => {
                      getItems(
                        recommendationsMetadata.subject,
                        adjustedNumberOfItems * resolvedNumRows,
                      );
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
        getItems(subject, numberOfItems * recommendationNumRows);
      }
    } else {
      clearItems();
    }
  };

  useEffect(() => {
    initRecommendations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Skips its own first run, which is what Angular's $watch guard did explicitly
  // (`typeof oldVals.recommendationSubtype === 'number'`). Without this both effects fire on mount and
  // the whole init sequence runs TWICE: three endpoints plus both IXP layers, so exposure is logged
  // twice and the experiment's numbers are wrong.
  const initialised = useRef(false);
  useEffect(() => {
    if (!initialised.current) {
      initialised.current = true;
      return;
    }
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
      onItemClick?.({
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
  }, [items, recommendationType, recommendationSubtype, onItemClick]);

  const getSeeAllLink = () => {
    const type = recommendationType || 0;
    if (seeAllRecommendationLinks[type as 0 | 2]?.[recommendationSubtype]) {
      return seeAllRecommendationLinks[type as 0 | 2][recommendationSubtype];
    }
    return absoluteCatalogUrl;
  };

  return (
    <RecommendationsCarousel
      items={items}
      showSeeAllButton={showSeeAllButton}
      seeAllHref={getSeeAllLink()}
      singleRow={recommendationNumRows <= 1}
      moreByCreatorEnabled={isMoreByCreatorEnabled}
      complimentary={complimentaryItemRecommendations}
      displayCount={displayCount}
      listRef={recommendedItemsRef}
      numberOfItems={numberOfItems}
      isPremiumIconOnItemTilesEnabled={library.isPremiumIconOnItemTilesEnabled}
      isPremiumPriceOnItemTilesEnabled={library.isPremiumPriceOnItemTilesEnabled}
    />
  );
};

export default Recommendations;
