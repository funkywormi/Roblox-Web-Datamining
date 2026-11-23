import { Fragment, useEffect, useState, type ReactNode } from "react";
import classNames from "classnames";
import { Button } from "@rbx/foundation-ui";
import { getDeviceMeta } from "@rbx/core-scripts/meta/device";
import assetsConstants from "../constants/assetsConstants";
import type { AssetItem, Category, CurrentData, PageType } from "../constants/types";
import type { AssetsPager } from "../hooks/useCursorPager";
import useItemHydration from "../hooks/useItemHydration";
import { useItemsTranslate } from "../hooks/useItemsTranslate";
import { getCatalogMetadata, type CatalogMetadata } from "../services/assetsService";
import type { LayoutData } from "../utils/itemPrice";
import {
  getExploreMessageKey,
  getInventoryEmptyMessageKey,
  getInventoryNewItemsMessageKey,
  showMessageToFindNewItems,
} from "../utils/messages";
import { sendUserItemsPage } from "../utils/sendUserItemsPage";
import splitStringToMultipleLines from "../utils/splitStringToMultipleLines";
import CategoryDropdowns from "./CategoryDropdowns";
import CategoryMenu from "./CategoryMenu";
import CursorPager from "./CursorPager";
import ItemCard from "./ItemCard";
import "../css/assetsExplorer.scss";

export type AssetsExplorerProps = {
  pageType: PageType;
  assets: AssetItem[];
  assetsPager: AssetsPager;
  categories: Category[] | undefined;
  currentData: CurrentData;
  showCreatorName: boolean;
  canViewInventory: string | undefined;
  isOwnPage: boolean;
  toolbar?: ReactNode;
  catalogMetadata?: CatalogMetadata;
};

const toLayoutData = ({
  isPremiumIconOnItemTilesEnabled,
  isPremiumPriceOnItemTilesEnabled,
}: CatalogMetadata): LayoutData => ({
  isPremiumIconOnItemTilesEnabled,
  isPremiumPriceOnItemTilesEnabled,
});

const getIsLibraryLinkEnabled = (): boolean => {
  const deviceMeta = getDeviceMeta();
  return !deviceMeta?.isInApp && !deviceMeta?.isPhone && !deviceMeta?.isTablet;
};

const AssetsExplorer = ({
  pageType,
  assets,
  assetsPager,
  categories,
  currentData,
  showCreatorName,
  canViewInventory,
  isOwnPage,
  toolbar,
  catalogMetadata,
}: AssetsExplorerProps) => {
  const translate = useItemsTranslate();
  const [layoutData, setLayoutData] = useState<LayoutData>(() =>
    catalogMetadata ? toLayoutData(catalogMetadata) : assetsConstants.defaultLayoutData,
  );
  const [isLibraryLinkEnabled] = useState(getIsLibraryLinkEnabled);
  const hydratedAssets = useItemHydration(assets, currentData.itemSection);
  const { category, subcategory } = currentData;
  const hasSubcategories = (category?.items.length ?? 0) > 1;
  const isPlaceCategory = category?.categoryType === assetsConstants.types.place;
  const canView = canViewInventory === "True";

  useEffect(() => {
    if (catalogMetadata) {
      return;
    }
    getCatalogMetadata()
      .then(metadata => {
        setLayoutData(toLayoutData(metadata));
      })
      .catch(() => undefined);
  }, [catalogMetadata]);

  const onItemCardClick = (item: AssetItem) => {
    const itemId = item.itemV2?.id;
    if (!itemId) {
      return;
    }

    sendUserItemsPage({
      pageType,
      eventType: "click",
      component: "item",
      categoryName: category?.name ?? "",
      subcategoryName: subcategory?.name ?? "",
      isOwnPage,
      componentId: String(itemId),
      categoryExtra: currentData.categoryExtra,
      itemType: item.itemV2?.type,
    });
  };

  const newItemsMessage = getInventoryNewItemsMessageKey(
    isLibraryLinkEnabled,
    currentData.itemSection,
  );

  return (
    <div className="col-xs-12 rbx-tabs-vertical assets-explorer-main-content">
      <div className="tab-content-group">
        <CategoryDropdowns
          categories={categories ?? []}
          currentCategory={category}
          currentSubcategory={subcategory}
        />
        {categories && (
          <CategoryMenu
            categories={categories}
            currentCategory={category}
            currentSubcategory={subcategory}
          />
        )}
        <div className="tab-content rbx-tab-content">
          <div
            className={classNames("current-items", { "hide-items": !currentData.templateVisible })}
          >
            <div
              className={classNames("container-header", {
                "place-header": isPlaceCategory && isOwnPage,
              })}
            >
              <div className="assets-explorer-title">
                <div className={classNames({ "hidden-xs": hasSubcategories })}>
                  <ul className="breadcrumb-container">
                    <li>
                      <span>{category?.displayName}</span>
                    </li>
                    {hasSubcategories && (
                      <Fragment>
                        <li>
                          <span className="icon-right-16x16" />
                        </li>
                        <li>
                          <span>{subcategory?.displayName}</span>
                        </li>
                      </Fragment>
                    )}
                  </ul>
                </div>
              </div>
              {currentData.itemSection !== null && (
                <div className="header-content">
                  <Button
                    as="a"
                    href={currentData.assetTypeUrl}
                    variant="Emphasis"
                    size="Medium"
                    className="btn-more"
                  >
                    {translate("Action.GetMore")}
                  </Button>
                  <div className="small text get-more">
                    <pre className="get-more-text">
                      {splitStringToMultipleLines.wrapStringByLines(
                        translate(getExploreMessageKey(currentData.itemSection), {
                          itemsPlural: category?.displayName ?? "",
                        }),
                        2,
                      )}
                    </pre>
                  </div>
                </div>
              )}
            </div>
            <div>{toolbar}</div>
            {!canView && (
              <div className="item-cards">
                <div className="section-content-off">
                  <span>{translate("Message.UserInventoryHidden")}</span>
                </div>
              </div>
            )}
            {canView && currentData.loadFailed && (
              <div
                className={classNames("item-cards", {
                  "hide-items": currentData.itemsLoading,
                })}
              >
                <div className="section-content-off">
                  <span>{translate("Response.GenericError")}</span>
                </div>
              </div>
            )}
            {canView && !currentData.loadFailed && hydratedAssets.length < 1 && (
              <div
                className={classNames("item-cards", {
                  "hide-items": currentData.itemsLoading,
                })}
              >
                <div className="section-content-off">
                  <span>{translate(getInventoryEmptyMessageKey(isOwnPage, pageType))}</span>{" "}
                  {showMessageToFindNewItems(pageType, category, subcategory) &&
                    newItemsMessage && (
                      <span>
                        {newItemsMessage.hasLink
                          ? translate.html(newItemsMessage.key, [
                              {
                                opening: "startLink",
                                closing: "endLink",
                                render: children => (
                                  <a className="text-link" href={currentData.assetTypeUrl}>
                                    {children}
                                  </a>
                                ),
                              },
                            ])
                          : translate(newItemsMessage.key)}
                      </span>
                    )}
                </div>
              </div>
            )}
            {canView && (
              <ul
                id="assetsItems"
                className={classNames("hlist item-cards item-cards-embed", {
                  "hide-items": currentData.itemsLoading,
                })}
              >
                {hydratedAssets.map((item, index) => (
                  <ItemCard
                    // eslint-disable-next-line react/no-array-index-key
                    key={index}
                    item={item}
                    layoutData={layoutData}
                    isPlaceItem={isPlaceCategory}
                    showCreatorName={showCreatorName}
                    showOwnershipPreposition={
                      !(
                        currentData.inventoryUpdatesEnabled &&
                        subcategory?.filter === assetsConstants.types.myPrivateServers
                      )
                    }
                    onClick={onItemCardClick}
                  />
                ))}
              </ul>
            )}
            <CursorPager pager={assetsPager} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetsExplorer;
