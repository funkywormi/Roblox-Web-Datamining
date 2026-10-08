import { useState, useEffect, useCallback } from 'react';
import type { AxiosPromise } from '@rbx/core-scripts/http';
import itemDetailsService from '../services/itemDetailsService';
import itemPurchaseConstants from '../constants/itemPurchaseConstants';
import type { CatalogItemDetails, ItemDetail } from '../types/itemDetails';
import type { PurchaseErrorResponse } from '../types/purchase';

const { errorMessages } = itemPurchaseConstants;

type ItemMethod = (itemId: number, itemType: string) => AxiosPromise<CatalogItemDetails>;

const initialItemDetail: ItemDetail = {
  expectedSellerId: 0,
  owned: false,
  isPurchasable: false,
  id: 0,
  itemType: '',
  assetType: 0,
  name: '',
  description: '',
  productId: 0,
  creatorTargetId: 0,
  creatorName: '',
  price: null,
  loading: true,
  loadFailure: false,
  premiumDiscountPercentage: null,
  hasLimitedPrivateSales: false,
  isPublicDomain: false,
  premiumPriceInRobux: null,
  assetTypeDisplayName: '',
  offSaleDeadline: null,
  unitsAvailableForConsumption: 0,
  isLimited: false,
  resellerAvailable: false,
  priceStatus: ''
};

function LoadItemDetails(itemMethod: ItemMethod, itemId: number, itemType: string) {
  const [itemDetail, setItemDetail] = useState<ItemDetail>(initialItemDetail);

  const setItemLoadFailure = () => {
    setItemDetail(prev => ({
      ...prev,
      loading: false,
      loadFailure: true
    }));
  };
  const loadItemDetail = useCallback(() => {
    itemMethod(itemId, itemType)
      .then((result) => {
        const { data } = result;
        const item: ItemDetail = {
          ...initialItemDetail,
          expectedSellerId: data.expectedSellerId,
          owned: data.owned,
          id: data.id,
          itemType: data.itemType,
          assetType: data.assetType,
          name: data.name,
          description: data.description,
          productId: data.productId,
          price: data.price,
          lowestPrice: data.lowestPrice,
          creatorTargetId: data.creatorTargetId,
          creatorName: data.creatorName,
          hasLimitedPrivateSales: data.lowestPrice !== undefined,
          isPublicDomain: data.price === 0,
          offSaleDeadline: data.offSaleDeadline,
          isLimited:
            data.itemRestrictions.includes('Limited') ||
            data.itemRestrictions.includes('LimitedUnique'),
          unitsAvailableForConsumption:
            data.unitsAvailableForConsumption !== undefined ? data.unitsAvailableForConsumption : 0,
          priceStatus: data.priceStatus !== undefined ? data.priceStatus : '',
          itemRestrictions: data.itemRestrictions
        };
        if (data.premiumPricing !== undefined) {
          item.premiumPriceInRobux = data.premiumPricing.premiumPriceInRobux;
          item.premiumDiscountPercentage = data.premiumPricing.premiumDiscountPercentage;
        }
        if (item.isLimited) {
          item.price = item.lowestPrice !== undefined ? item.lowestPrice : item.price;
        }
        itemDetailsService
          .getItemPurchasableDetail(data.productId)
          .then(res => {
            if (
              !res.data.purchasable &&
              res.data.reason &&
              res.data.reason !== errorMessages.insufficientFunds
            ) {
              item.isPurchasable = res.data.purchasable;
            } else {
              item.isPurchasable = true;
            }
            item.assetTypeDisplayName = res.data.assetTypeDisplayName;
            item.loading = false;
            item.loadFailure = false;
            itemDetailsService
              .getEconomyMetadata()
              .then(metadata => {
                item.isMarketPlaceEnabled =
                  metadata.data.isMarketPlaceEnabled && metadata.data.isItemsXchangeEnabled;
                setItemDetail(item);
              })
              .catch(() => {
                setItemLoadFailure();
              });
          })
          .catch((err: PurchaseErrorResponse) => {
            if (err.statusText === errorMessages.unauthorizedMessage) {
              item.loading = false;
              item.loadFailure = false;
              setItemDetail(item);
            } else {
              setItemLoadFailure();
            }
          });
      })
      .catch(() => {
        setItemLoadFailure();
      });
  }, [itemId, itemType, itemMethod]);

  useEffect(() => {
    loadItemDetail();
  }, []);

  return {
    itemDetail,
    loadItemDetail
  };
}

export default LoadItemDetails;
