import React, { useCallback } from 'react';
import { ItemCard, ItemCardUtils, ShoppingCartProps } from 'react-style-guide';
import {
  DefaultThumbnailSize,
  Thumbnail2d,
  ThumbnailAssetsSize,
  ThumbnailTypes
} from 'roblox-thumbnails';
import { BadgeSizes, VerifiedBadgeIconContainer } from 'roblox-badges';
import classNames from 'classnames';
import { WithTranslationsProps, withTranslations } from 'react-utilities';
import { TTimedOption } from 'Roblox';
import ShimmerContainer from '../../shimmerContainer/ShimmerContainer';
import { Layout, ItemWithDetails } from '../../../constants/types';
import useShoppingCart from '../../../../shoppingCart/hooks/useShoppingCart';
import { TAssetItemDetails } from '../../../../itemDetailsInfo/constants/types';
import { processTimedOptionsForCart } from '../../../../shoppingCart/utils/cartUtils';
import { translationConfig } from '../../../translation.config';
import {
  trackItemCardClick,
  trackShoppingCartAddClick,
  trackShoppingCartRemoveClick,
  TItemCardSource,
  TCartActionSource
} from '../../../../analytics/axTrackingEvents';

type ItemWithTimedOptions = ItemWithDetails & {
  timedOptions?: TTimedOption[];
};

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
    numberOfItemsToDisplay
  } = props;

  const { isItemInCart, addItemToCart, removeItemFromCart } = useShoppingCart();

  const showError = layout.searchItemsError && !layout.loading;

  const renderError = useCallback(() => {
    return (
      <div className='section-content-off'>
        {translate(
          layout.searchItemsError === 'no_results'
            ? 'Response.NoItemsFound'
            : 'Response.TemporarilyUnavailable'
        )}
      </div>
    );
  }, [layout.searchItemsError, translate]);

  const renderItemCard = useCallback(
    (item: ItemWithDetails) => {
      let { price, lowestPrice } = item;
      const shoppingCartProps: ShoppingCartProps = {
        isItemInCart: isItemInCart(item.id),
        addItemToCart: (itemInfo, displaySystemFeedback) => {
          trackShoppingCartAddClick(TCartActionSource.CatalogItemCard, {
            itemId: itemInfo.itemId,
            itemType: itemInfo.itemType
          });
          return addItemToCart(itemInfo, displaySystemFeedback);
        },
        removeItemFromCart: (itemId, itemType, displaySystemFeedback) => {
          trackShoppingCartRemoveClick(TCartActionSource.CatalogItemCard, { itemId, itemType });
          return removeItemFromCart(itemId, itemType, displaySystemFeedback);
        }
      };
      // Process timed options to ensure permanent option is included
      const itemWithTimedOptions = item as ItemWithTimedOptions;
      const processedTimedOptions = processTimedOptionsForCart(
        itemWithTimedOptions.timedOptions,
        item.price ?? 0
      );

      if (processedTimedOptions && processedTimedOptions.length > 0) {
        const selectedTimedOption = processedTimedOptions.find(option => option.selected);
        if (selectedTimedOption) {
          price = selectedTimedOption.price;
          lowestPrice = selectedTimedOption.price;
        }
      }
      return (
        // eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
        <div
          key={item.id}
          style={{ display: 'contents' }}
          onClick={() =>
            trackItemCardClick(TItemCardSource.Catalog, {
              itemId: item.id,
              itemType: item.itemType
            })
          }>
          <ItemCard
            key={item.id}
            id={item.id}
            name={item.name}
            type={item.itemType}
            creatorName={item.creatorName}
            creatorType={item.creatorType}
            creatorTargetId={item.creatorTargetId}
            price={price}
            lowestPrice={lowestPrice}
            unitsAvailableForConsumption={item.unitsAvailableForConsumption}
            itemStatus={(item as TAssetItemDetails).itemStatus}
            priceStatus={item.priceStatus}
            premiumPricing={item.premiumPricing?.premiumPriceInRobux}
            itemRestrictions={item.itemRestrictions}
            thumbnail2d={
              <Thumbnail2d
                type={
                  ItemCardUtils.checkIfBundle(item.itemType)
                    ? ThumbnailTypes.bundleThumbnail
                    : ThumbnailTypes.assetThumbnail
                }
                targetId={item.id}
                size={
                  enableCatalogRevampExperiment ? ThumbnailAssetsSize.size420 : DefaultThumbnailSize
                }
              />
            }
            iconToRender={
              item.creatorHasVerifiedBadge ? (
                <VerifiedBadgeIconContainer
                  overrideImgClass='verified-badge-icon-catalog-item-rendered'
                  size={BadgeSizes.TITLE}
                  titleText={item.creatorTargetId.toString()}
                />
              ) : undefined
            }
            shoppingCartProps={shoppingCartProps}
            containerClassName={
              enableCatalogRevampExperiment ? 'catalog-item-container' : undefined
            }
            enableThumbnailPrice={enableThumbnailPrice}
            timedOptions={processedTimedOptions}
          />
        </div>
      );
    },
    [
      addItemToCart,
      enableCatalogRevampExperiment,
      enableThumbnailPrice,
      isItemInCart,
      removeItemFromCart
    ]
  );

  const renderItemCards = useCallback(() => {
    return (
      <React.Fragment>
        {/* Item Cards */}
        <ul
          className={classNames('hlist item-cards-stackable', {
            faded: !isPaginationEnabled && layout.loading,
            'organic-items-wrapper': enableCatalogRevampExperiment
          })}>
          {orderedItems?.map(item => {
            if (item.debugInfo) {
              const { dataSource, engagementScore, relevanceScore } = item.debugInfo;
              const dataSourceText = `dataSource: ${dataSource ?? ''}`;
              const engagementScoreText = `engagementScore: ${engagementScore ?? ''}`;
              const relevanceScoreText = `relevanceScore: ${relevanceScore ?? ''}`;
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {renderItemCard(item)}
                  <span
                    style={{
                      fontSize: '12px'
                    }}>
                    {dataSourceText}
                  </span>
                  <span
                    style={{
                      fontSize: '12px'
                    }}>
                    {engagementScoreText}
                  </span>
                  <span
                    style={{
                      fontSize: '12px'
                    }}>
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
    renderItemCard
  ]);

  return (
    <React.Fragment>
      {showError ? renderError() : renderItemCards()}

      {/* Spinners and Shimmer Effects */}
      {layout.initialized && layout.loading && <div className='spinner spinner-sm' />}
      {showShimmer && (
        <ShimmerContainer
          numberOfItemsToDisplay={numberOfItemsToDisplay}
          shimmerCardClassName={
            enableCatalogRevampExperiment ? 'catalog-item-container' : undefined
          }
        />
      )}
    </React.Fragment>
  );
}

export default withTranslations(ItemResults, translationConfig);
