import React, { useCallback } from "react";
import classNames from "classnames";
import { WithTranslationsProps, withTranslations } from "react-utilities";
import ShimmerContainer from "../../shimmerContainer/ShimmerContainer";
import { Layout, ItemWithDetails } from "../../../constants/types";
import { translationConfig } from "../../../translation.config";
import useCatalogItemCardRenderer from "./useCatalogItemCardRenderer";

export type ItemResultsProps = {
  layout: Layout;
  isPaginationEnabled: boolean;
  enableThumbnailPrice?: boolean;
  enableCatalogRevampExperiment?: boolean;
  orderedItems: ItemWithDetails[] | undefined;
  showShimmer: boolean;
  numberOfItemsToDisplay: number;
};

function ItemResults(props: ItemResultsProps & WithTranslationsProps): JSX.Element {
  const {
    layout,
    isPaginationEnabled,
    translate,
    enableThumbnailPrice,
    enableCatalogRevampExperiment,
    orderedItems,
    showShimmer,
    numberOfItemsToDisplay,
  } = props;

  const renderItemCard = useCatalogItemCardRenderer({
    enableThumbnailPrice,
    enableCatalogRevampExperiment,
  });

  const showError = layout.searchItemsError && !layout.loading;

  const renderError = useCallback(() => {
    return (
      <div className="section-content-off">
        {translate(
          layout.searchItemsError === "no_results"
            ? "Response.NoItemsFound"
            : "Response.TemporarilyUnavailable",
        )}
      </div>
    );
  }, [layout.searchItemsError, translate]);

  const renderItemCards = useCallback(() => {
    return (
      <React.Fragment>
        {/* Item Cards */}
        <ul
          className={classNames("hlist item-cards-stackable", {
            faded: !isPaginationEnabled && layout.loading,
            "organic-items-wrapper": enableCatalogRevampExperiment,
          })}
        >
          {orderedItems?.map(item => {
            if (item.debugInfo) {
              const { dataSource, engagementScore, relevanceScore } = item.debugInfo;
              const dataSourceText = `dataSource: ${dataSource ?? ""}`;
              const engagementScoreText = `engagementScore: ${engagementScore ?? ""}`;
              const relevanceScoreText = `relevanceScore: ${relevanceScore ?? ""}`;
              return (
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {renderItemCard(item)}
                  <span
                    style={{
                      fontSize: "12px",
                    }}
                  >
                    {dataSourceText}
                  </span>
                  <span
                    style={{
                      fontSize: "12px",
                    }}
                  >
                    {engagementScoreText}
                  </span>
                  <span
                    style={{
                      fontSize: "12px",
                    }}
                  >
                    {relevanceScoreText}
                  </span>
                </div>
              );
            }

            return renderItemCard(item);
          })}
        </ul>
      </React.Fragment>
    );
  }, [
    enableCatalogRevampExperiment,
    isPaginationEnabled,
    layout.loading,
    orderedItems,
    renderItemCard,
  ]);

  return (
    <React.Fragment>
      {showError ? renderError() : renderItemCards()}

      {/* Spinners and Shimmer Effects */}
      {layout.initialized && layout.loading && <div className="spinner spinner-sm" />}
      {showShimmer && (
        <ShimmerContainer
          numberOfItemsToDisplay={numberOfItemsToDisplay}
          shimmerCardClassName={
            enableCatalogRevampExperiment ? "catalog-item-container" : undefined
          }
        />
      )}
    </React.Fragment>
  );
}

export default withTranslations(ItemResults, translationConfig);
