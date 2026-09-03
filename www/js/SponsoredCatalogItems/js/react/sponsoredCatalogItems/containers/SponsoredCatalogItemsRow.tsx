import React, { useState, useCallback } from 'react';
import { AxiosResponse } from 'core-utilities';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { ItemCardUtils } from 'react-style-guide';
import { Thumbnail2d, ThumbnailTypes, DefaultThumbnailSize } from 'roblox-thumbnails';
import SponsoredCatalogItemsService, {
  TSponsoredCatalogItemsDetailsResult,
  TCatalogSearchDetailedResponseItem,
  TSponsoredCatalogItemsResult,
  TSponsoredCatalogItem
} from '../services/SponsoredCatalogItemsService';
import { TSponsoredCatalogItemsRow } from './SponsoredCatalogItemsRowTypes';
import { SponsoredCatalogItemCard } from './SponsoredCatalogItemCard';
import sponsoredCatalogItemsConstants from '../constants/sponsoredCatalogItemsConstants';
import translationConfig from '../translation.config';

type TSponsoredCatalogItemsRowProps = {
  placementLocation: string;
};

export const SponsoredCatalogItemsRow = ({
  placementLocation,
  translate
}: TSponsoredCatalogItemsRowProps & WithTranslationsProps): JSX.Element | null => {
  const [sponsoredCatalogItems, setSponsoredCatalogItems] = useState<
    Array<TSponsoredCatalogItem> | undefined
  >(undefined);
  const [hydratedItems, setHydratedItems] = useState<
    Array<TCatalogSearchDetailedResponseItem> | undefined
  >(undefined);

  const getAdCountForCatalogPage = () => {
    const screenWidth = window.innerWidth;
    const { sizing } = sponsoredCatalogItemsConstants;
    let count = 0;
    if (screenWidth < sizing.screenSize1Item) {
      count = 1;
    } else if (screenWidth < sizing.screenSize3Items) {
      count = 3;
    } else if (screenWidth < sizing.screenSize4Items) {
      count = 4;
    } else if (screenWidth < sizing.screenSize5Items) {
      count = 5;
    } else if (screenWidth < sizing.screenSize6Items) {
      count = 6;
    } else {
      const tileSize = sizing.tileWidth;
      const rowWidth =
        screenWidth - sizing.catalogLeftNav - sizing.websiteLeftNav - sizing.extraSpace;
      count = Math.floor(rowWidth / tileSize);
    }
    return count;
  };

  const getAdCount = useCallback(() => {
    let adCount = 0;
    switch (placementLocation) {
      case 'AvatarShop':
        adCount = getAdCountForCatalogPage();
        break;
      case 'ItemDetails':
        adCount = sponsoredCatalogItemsConstants.itemDetailsAdCount;
        break;
      default:
    }
    return adCount;
  }, [placementLocation]);

  const getSponsoredCatalogItems = useCallback(async () => {
    return SponsoredCatalogItemsService.getSponsoredCatalogItems(
      getAdCount(),
      sponsoredCatalogItemsConstants.catalogCategoryType,
      placementLocation
    );
  }, [getAdCount, placementLocation]);

  const getCatalogItemsDetails = useCallback(async (items: TSponsoredCatalogItem[]) => {
    const formattedIds = Array<{ itemType: string; id: number }>();
    items.forEach(item => {
      formattedIds.push({ itemType: item.itemType, id: item.id });
    });
    return SponsoredCatalogItemsService.getCatalogItemsDetails(formattedIds);
  }, []);

  const getSponsoredItems = useCallback(() => {
    getSponsoredCatalogItems()
      .then((response: AxiosResponse<TSponsoredCatalogItemsResult>) => {
        setSponsoredCatalogItems(response.data.data);
        getCatalogItemsDetails(response.data.data)
          .then((detailsResponse: AxiosResponse<TSponsoredCatalogItemsDetailsResult>) => {
            setHydratedItems(detailsResponse.data.data);
          })
          .catch(() => {
            setHydratedItems([]);
          });
      })
      .catch(() => {
        setSponsoredCatalogItems([]);
        setHydratedItems([]);
      });
  }, [getSponsoredCatalogItems, getCatalogItemsDetails]);

  // loading phase
  if (hydratedItems === undefined && sponsoredCatalogItems === undefined) {
    getSponsoredItems();
    return (
      <div className='sponsored-catalog-items-container' id='loading-sponsored-catalog-items'>
        <div className='sponsored-catalog-items-loading-title shimmer' />
        <div className='sponsored-catalog-items-loading-row' />
        <div className='sponsored-catalog-items-row'>
          {Array.from({ length: getAdCount() }, (_, id) => (
            <div key={id} className='grid-item-container item-card item-card-loading'>
              <div className='item-card-thumb-container shimmer' />
              <div className='item-card-link'>
                <div className='item-card-name shimmer' />
                <div className='item-card-name item-name-title-half shimmer' />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (
    hydratedItems &&
    hydratedItems.length > 0 &&
    sponsoredCatalogItems &&
    sponsoredCatalogItems.length > 0
  ) {
    if (placementLocation === 'ItemDetails') {
      return (
        <React.Fragment>
          <div
            className='container-list sponsored-layer recommendations-container'
            id='populated-sponsored-catalog-items'>
            <div className='container-header recommendations-header'>
              <h2>{translate('Label.Sponsored')}</h2>
            </div>
            <div className='recommended-items-slider'>
              <ul className='hlist item-cards recommended-items'>
                {hydratedItems.map((item: TCatalogSearchDetailedResponseItem, index: number) => {
                  return (
                    <SponsoredCatalogItemCard
                      key={item.id} // react jsx key
                      id={item.id}
                      name={item.name}
                      type={item.itemType}
                      creatorName={item.creatorName}
                      creatorType={item.creatorType}
                      creatorTargetId={item.creatorTargetId}
                      price={item.price || 0}
                      lowestPrice={item.lowestPrice || -1}
                      priceStatus={item.priceStatus}
                      premiumPricing={item.premiumPricing?.premiumPriceInRobux || -1}
                      unitsAvailableForConsumption={item.unitsAvailableForConsumption || 0}
                      itemStatus={item.itemStatus}
                      itemRestrictions={item.itemRestrictions}
                      thumbnail2d={
                        <Thumbnail2d
                          type={
                            ItemCardUtils.checkIfBundle(item.itemType)
                              ? ThumbnailTypes.bundleThumbnail
                              : ThumbnailTypes.assetThumbnail
                          }
                          targetId={item.id}
                          size={DefaultThumbnailSize}
                        />
                      }
                      encryptedAdTrackingData={sponsoredCatalogItems[index].encryptedAdTrackingData}
                      placementLocation={placementLocation}
                    />
                  );
                })}
              </ul>
            </div>
          </div>
        </React.Fragment>
      );
    }

    if (placementLocation === 'AvatarShop') {
      return (
        <React.Fragment>
          <div className='sponsored-catalog-items-container' id='populated-sponsored-catalog-items'>
            <h2 className='sponsored-catalog-items-row-title'>{translate('Label.Sponsored')}</h2>
            <div className='sponsored-catalog-items-row'>
              <div className='hlist item-cards-stackable'>
                {hydratedItems.map((item: TCatalogSearchDetailedResponseItem, index: number) => {
                  return (
                    <SponsoredCatalogItemCard
                      key={item.id} // react jsx key
                      id={item.id}
                      name={item.name}
                      type={item.itemType}
                      creatorName={item.creatorName}
                      creatorType={item.creatorType}
                      creatorTargetId={item.creatorTargetId}
                      price={item.price || 0}
                      lowestPrice={item.lowestPrice || -1}
                      priceStatus={item.priceStatus}
                      premiumPricing={item.premiumPricing?.premiumPriceInRobux || -1}
                      unitsAvailableForConsumption={item.unitsAvailableForConsumption || 0}
                      itemStatus={item.itemStatus}
                      itemRestrictions={item.itemRestrictions}
                      thumbnail2d={
                        <Thumbnail2d
                          type={
                            ItemCardUtils.checkIfBundle(item.itemType)
                              ? ThumbnailTypes.bundleThumbnail
                              : ThumbnailTypes.assetThumbnail
                          }
                          targetId={item.id}
                          size={DefaultThumbnailSize}
                        />
                      }
                      encryptedAdTrackingData={sponsoredCatalogItems[index].encryptedAdTrackingData}
                      placementLocation={placementLocation}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </React.Fragment>
      );
    }
  }

  // default to no-show
  return <div />;
};

export default withTranslations(
  SponsoredCatalogItemsRow,
  translationConfig
) as TSponsoredCatalogItemsRow;
