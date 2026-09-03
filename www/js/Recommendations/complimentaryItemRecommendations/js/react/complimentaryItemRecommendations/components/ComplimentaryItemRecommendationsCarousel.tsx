/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React, { useState, useCallback, useEffect } from 'react';
import { AxiosResponse } from 'core-utilities';
import { authenticatedUser } from 'header-scripts';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { BatchBuyPriceContainer } from 'roblox-item-purchase';
import { number } from 'prop-types';
import { ItemDetailsHydrationService, TDetailEntry } from 'Roblox';
import {
  complimentaryItemRecommendationsService,
  TRecommendationResult,
  TDetailResult,
  TItemDetailRequestEntry
} from '../services/complimentaryItemRecommendationService';
import translationConfig from '../translation.config';
import ComplimentaryItemRecommendationsItemCard from './ComplimentaryItemRecommendationsItemCard';
import { getNumberFormat } from '../utils/parsingUtils';
import complimentaryItemRecommendationsConstants from '../constants/complimentaryItemRecommendationsConstants';

type TComplimentaryItemRecommendationsCarouselProps = {
  itemId: number;
  isBundle: boolean;
  displayPurchaseButtonLeft: boolean;
  systemFeedbackService: any;
};

type TPurchaseDataResult = {
  itemData: {
    assetId: number;
    bundleId: number;
  };
  reason: string;
};

type TOwnershipResult = {
  id: number;
  isOwned: boolean;
};

export type TItemDisabledReason = {
  isOwned: boolean;
  noSellers: boolean;
};

export const ComplimentaryItemRecommendationsCarousel = ({
  itemId,
  isBundle,
  displayPurchaseButtonLeft,
  systemFeedbackService,
  translate
}: TComplimentaryItemRecommendationsCarouselProps & WithTranslationsProps): JSX.Element | null => {
  const [itemDetail, setItemDetail] = useState<TDetailEntry>();
  const [recommendedItems, setRecommendedItems] = useState<Array<TItemDetailRequestEntry>>();
  const [recommendedItemDetails, setRecommendedItemDetails] = useState<Array<TDetailEntry>>();
  const [itemSelection, setItemSelection] = useState<Record<number, boolean>>();
  const [selectedItems, setSelectedItems] = useState<Array<TDetailEntry>>();
  const [disabledItemsRecord, setDisabledItemsRecord] = useState<
    Record<number, TItemDisabledReason>
  >({});
  const [totalPrice, setTotalPrice] = useState<number>();
  const [ownershipRecord, setOwnershipRecord] = useState<Record<number, boolean>>({});
  const [loadFailure, setLoadFailure] = useState<boolean>(false);
  const { itemTypeConstants } = complimentaryItemRecommendationsConstants;

  const getRecommendations = useCallback((id: number) => {
    return complimentaryItemRecommendationsService.getRecommendations(id);
  }, []);
  const postItemDetails = useCallback((items: Array<TItemDetailRequestEntry>) => {
    return ItemDetailsHydrationService.getItemDetails(items);
  }, []);
  const getItemOwnership = useCallback(
    async (userId: number, itemType: string, itemTargetId: number) => {
      const response = await complimentaryItemRecommendationsService.getItemOwnership(
        userId,
        itemType,
        itemTargetId
      );
      const result = { response, itemTargetId };
      return result;
    },
    []
  );

  const getPriceForItem = useCallback((item: TDetailEntry | undefined) => {
    if (item === undefined) {
      return 0;
    }
    if (
      authenticatedUser.isPremiumUser &&
      item.premiumPricing !== undefined &&
      item.premiumPricing.premiumPriceInRobux >= 0
    ) {
      return item.premiumPricing.premiumPriceInRobux;
    }
    if (item.lowestPrice !== undefined && item.lowestPrice >= 0) {
      return item.lowestPrice;
    }
    if (item.price === undefined) {
      return 0;
    }
    return item.price;
  }, []);

  const updateTotalPrice = useCallback(() => {
    let totalPriceModified = 0;
    if (
      itemDetail &&
      selectedItems?.includes(itemDetail) &&
      (!disabledItemsRecord[itemDetail.id] ||
        (!disabledItemsRecord[itemDetail.id].isOwned &&
          !disabledItemsRecord[itemDetail.id].noSellers))
    ) {
      totalPriceModified += getPriceForItem(itemDetail);
    }
    if (recommendedItemDetails !== undefined) {
      recommendedItemDetails.forEach(item => {
        if (
          selectedItems?.includes(item) &&
          (!disabledItemsRecord[item.id] ||
            (!disabledItemsRecord[item.id].isOwned && !disabledItemsRecord[item.id].noSellers))
        ) {
          totalPriceModified += getPriceForItem(item);
        }
      });
    }

    setTotalPrice(totalPriceModified);
  }, [disabledItemsRecord, getPriceForItem, itemDetail, recommendedItemDetails, selectedItems]);

  const checkOwnershipForItem = useCallback(async (itemTargetId: number) => {
    if (!authenticatedUser.isAuthenticated) {
      return { id: itemTargetId, isOwned: false } as TOwnershipResult;
    }
    if (ownershipRecord[itemTargetId] !== undefined) {
      return {
        id: itemTargetId,
        isOwned: ownershipRecord[itemTargetId]
      } as TOwnershipResult;
    }
    const response = await getItemOwnership(
      authenticatedUser.id,
      isBundle
        ? complimentaryItemRecommendationsConstants.itemTypeConstants.bundle
        : complimentaryItemRecommendationsConstants.itemTypeConstants.asset,
      itemTargetId
    );
    if (!response.response.data) {
      return { id: itemTargetId, isOwned: false } as TOwnershipResult;
    }

    return { id: itemTargetId, isOwned: true } as TOwnershipResult;
  }, []);

  async function checkOwnershipForItems(itemTargetIds: Array<number>) {
    const updatedOwnershipRecord = ownershipRecord;
    const result = await Promise.all(itemTargetIds.map(item => checkOwnershipForItem(item)));
    const newDisabledItems = new Array<TDetailEntry>();
    const newDisabldItemsRecord = disabledItemsRecord;
    result.forEach(itemOwnership => {
      updatedOwnershipRecord[itemOwnership.id] = itemOwnership.isOwned;
      if (!itemOwnership.isOwned) {
        return;
      }

      if (itemDetail && itemOwnership.id === itemDetail.id) {
        if (
          !itemDetail.itemRestrictions.includes(complimentaryItemRecommendationsConstants.limited)
        ) {
          newDisabledItems.push(itemDetail);
          if (newDisabldItemsRecord && newDisabldItemsRecord[itemOwnership.id] === undefined) {
            newDisabldItemsRecord[itemOwnership.id] = { isOwned: true } as TItemDisabledReason;
          } else {
            newDisabldItemsRecord[itemOwnership.id].isOwned = true;
          }
        }
      }
      if (recommendedItemDetails !== undefined) {
        const item = recommendedItemDetails.find(i => {
          return i.id === itemOwnership.id;
        });
        if (
          item &&
          !item.itemRestrictions.includes(complimentaryItemRecommendationsConstants.limited)
        ) {
          newDisabledItems.push(item);
          if (newDisabldItemsRecord && newDisabldItemsRecord[itemOwnership.id] === undefined) {
            newDisabldItemsRecord[itemOwnership.id] = { isOwned: true } as TItemDisabledReason;
          } else {
            newDisabldItemsRecord[itemOwnership.id].isOwned = true;
          }
        }
      }
    });

    setOwnershipRecord(updatedOwnershipRecord);
    if (selectedItems) {
      const newSelectedItems = selectedItems;
      newDisabledItems.forEach(item => {
        const index = newSelectedItems.indexOf(item);
        if (index > -1) {
          newSelectedItems.splice(index, 1);
        }
      });
      setSelectedItems(newSelectedItems.slice());
    }
    setDisabledItemsRecord(newDisabldItemsRecord);
  }

  async function getComplimentaryRecommendations(response: AxiosResponse<TRecommendationResult>) {
    const { numberOfItemsToRecommend } = complimentaryItemRecommendationsConstants;
    let recommendationsCursor = 0;
    const finalRecommendations = [] as Array<TItemDetailRequestEntry>;
    const updatedOwnershipRecord = ownershipRecord;
    while (
      recommendationsCursor < response.data.data.length &&
      finalRecommendations.length < numberOfItemsToRecommend
    ) {
      const recommendationsEndCursor = recommendationsCursor + numberOfItemsToRecommend;
      const recommendationsSlice = response.data.data.slice(
        recommendationsCursor,
        recommendationsEndCursor
      );
      try {
        if (recommendationsSlice.length > 0) {
          // eslint-disable-next-line no-await-in-loop
          const result = await Promise.all(
            recommendationsSlice.map(item =>
              getItemOwnership(
                authenticatedUser.id,
                isBundle
                  ? complimentaryItemRecommendationsConstants.itemTypeConstants.bundle
                  : complimentaryItemRecommendationsConstants.itemTypeConstants.asset,
                item
              )
            )
          );
          result.forEach(itemOwnership => {
            updatedOwnershipRecord[itemOwnership.itemTargetId] = itemOwnership.response.data;
            if (
              finalRecommendations.length < numberOfItemsToRecommend &&
              !itemOwnership.response.data
            ) {
              const item = {
                id: itemOwnership.itemTargetId,
                itemType: isBundle
                  ? complimentaryItemRecommendationsConstants.itemTypeConstants.bundle
                  : complimentaryItemRecommendationsConstants.itemTypeConstants.asset
              } as TItemDetailRequestEntry;
              finalRecommendations.push(item);
            }
          });
        }
        recommendationsCursor += numberOfItemsToRecommend;
      } catch {
        recommendationsCursor = response.data.data.length;
      }
    }
    const remainder = numberOfItemsToRecommend - finalRecommendations.length;
    if (remainder > 0) {
      for (let count = 0; count < remainder; count++) {
        const item = {
          id: response.data.data[count],
          itemType: isBundle
            ? complimentaryItemRecommendationsConstants.itemTypeConstants.bundle
            : complimentaryItemRecommendationsConstants.itemTypeConstants.asset
        };
        finalRecommendations.push(item);
      }
    }
    setOwnershipRecord(updatedOwnershipRecord);
    setRecommendedItems(finalRecommendations);
  }

  const onCheckClicked = useCallback(
    (checkedItemId: number) => {
      const itemSelectionModified = {} as Record<number, boolean>;
      Object.assign(itemSelectionModified, itemSelection);
      itemSelectionModified[checkedItemId] = !itemSelectionModified[checkedItemId];

      let totalPriceModified = 0;
      const newSelectedItems: Array<TDetailEntry> = [];
      if (
        itemSelectionModified[itemId] &&
        itemDetail &&
        (!disabledItemsRecord[itemDetail.id] ||
          (!disabledItemsRecord[itemDetail.id].isOwned &&
            !disabledItemsRecord[itemDetail.id].noSellers))
      ) {
        totalPriceModified += getPriceForItem(itemDetail);
        newSelectedItems.push(itemDetail);
      }
      if (recommendedItemDetails !== undefined) {
        recommendedItemDetails.forEach(item => {
          if (
            itemSelectionModified[item.id] &&
            (!disabledItemsRecord[item.id] ||
              (!disabledItemsRecord[item.id].isOwned && !disabledItemsRecord[item.id].noSellers))
          ) {
            totalPriceModified += getPriceForItem(item);
            newSelectedItems.push(item);
          }
        });
      }

      setItemSelection(itemSelectionModified);
      setSelectedItems(newSelectedItems);
    },
    [
      disabledItemsRecord,
      getPriceForItem,
      itemDetail,
      itemId,
      itemSelection,
      recommendedItemDetails
    ]
  );

  useEffect(() => {
    getRecommendations(itemId)
      .then((response: AxiosResponse<TRecommendationResult>) => {
        getComplimentaryRecommendations(response).catch(() => {
          setLoadFailure(true);
        });
      })
      .catch(() => {
        setLoadFailure(true);
      });
  }, []);

  useEffect(() => {
    if (recommendedItems === undefined) {
      return;
    }
    let itemType = itemTypeConstants.asset;
    if (isBundle) {
      itemType = itemTypeConstants.bundle;
    }
    const itemDetailsRequests = [] as Array<TItemDetailRequestEntry>;
    const itemDetails = [] as Array<TDetailEntry>;
    const itemDetailOrder = {} as Record<number, number>;
    let itemCount = 0;
    const itemRequestEntry = {
      id: itemId,
      itemType
    } as TItemDetailRequestEntry;
    recommendedItems.forEach(item => {
      itemDetailsRequests.push(item);
      itemDetails.push();
      itemDetailOrder[item.id] = itemCount;
      itemCount += 1;
    });

    itemDetailsRequests.push(itemRequestEntry);
    itemDetails.push();
    postItemDetails(itemDetailsRequests)
      .then((detailResponse: Array<TDetailEntry>) => {
        let originalItemDetail;
        let totalPriceFromDetails = 0;
        const itemSelectionFromDetails = {} as Record<number, boolean>;
        const updatedDisabledRecord = disabledItemsRecord;
        const updatedSelectedItems = [] as Array<TDetailEntry>;
        detailResponse.forEach(item => {
          const itemPosition = itemDetailOrder[item.id];
          totalPriceFromDetails += getPriceForItem(item);
          itemSelectionFromDetails[item.id] = true;
          if (item.id !== itemId) {
            itemDetails[itemPosition] = item;
          } else {
            setItemDetail(item);
            originalItemDetail = item;
          }
          if (item.priceStatus?.includes('Off Sale') && item.lowestPrice === undefined) {
            if (updatedDisabledRecord && updatedDisabledRecord[item.id] === undefined) {
              updatedDisabledRecord[item.id] = { noSellers: true } as TItemDisabledReason;
            } else {
              updatedDisabledRecord[item.id].noSellers = true;
            }
          } else if (!disabledItemsRecord[item.id] || !disabledItemsRecord[item.id].isOwned) {
            updatedSelectedItems.push(item);
          }
        });
        setSelectedItems(updatedSelectedItems);
        setDisabledItemsRecord(updatedDisabledRecord);
        setItemSelection(itemSelectionFromDetails);
        setRecommendedItemDetails(itemDetails);
      })
      .catch(() => {
        console.warn('error');
      });
  }, [isBundle, itemId, postItemDetails, recommendedItems]);

  useEffect(() => {
    if (itemDetail && recommendedItemDetails) {
      const completeItemArray = [] as Array<number>;
      completeItemArray.push(itemDetail.id);
      recommendedItemDetails.forEach(item => {
        completeItemArray.push(item.id);
      });
      checkOwnershipForItems(completeItemArray).catch(() => {
        setLoadFailure(true);
      });
    }
  }, [itemDetail, recommendedItemDetails]);

  useEffect(() => {
    if (itemDetail && recommendedItemDetails) {
      updateTotalPrice();
    }
  }, [itemDetail, recommendedItemDetails, selectedItems, updateTotalPrice]);

  const onTransactionComplete = useCallback(
    (results: Array<Record<string, TPurchaseDataResult>>) => {
      let successCount = 0;
      const updatedOwnershipRecord = ownershipRecord;
      const updatedDisabledRecord = disabledItemsRecord;
      const updatedSelectedItems = selectedItems;
      results.forEach(result => {
        if (itemDetail && result.data.itemData.assetId === itemDetail.id) {
          if (
            result.data.reason ===
              complimentaryItemRecommendationsConstants.batchBuyPurchaseResults.success ||
            result.data.reason ===
              complimentaryItemRecommendationsConstants.batchBuyPurchaseResults.alreadyOwned
          ) {
            successCount += 1;
            if (
              !itemDetail.itemRestrictions.includes(
                complimentaryItemRecommendationsConstants.limited
              )
            ) {
              if (
                updatedDisabledRecord &&
                updatedDisabledRecord[result.data.itemData.assetId] === undefined
              ) {
                updatedDisabledRecord[result.data.itemData.assetId] = {
                  isOwned: true
                } as TItemDisabledReason;
              } else {
                updatedDisabledRecord[result.data.itemData.assetId].isOwned = true;
              }
              updatedOwnershipRecord[result.data.itemData.assetId] = true;
              if (updatedSelectedItems) {
                const index = updatedSelectedItems.indexOf(itemDetail);
                if (index > -1) {
                  updatedSelectedItems.splice(index, 1);
                }
              }
            }
          }
        } else if (recommendedItemDetails !== undefined) {
          if (
            result.data.reason ===
              complimentaryItemRecommendationsConstants.batchBuyPurchaseResults.success ||
            result.data.reason ===
              complimentaryItemRecommendationsConstants.batchBuyPurchaseResults.alreadyOwned
          ) {
            successCount += 1;
            const item = recommendedItemDetails.find(i => {
              return i.id === result.data.itemData.assetId;
            });
            if (
              item &&
              !item.itemRestrictions.includes(complimentaryItemRecommendationsConstants.limited)
            ) {
              if (
                updatedDisabledRecord &&
                updatedDisabledRecord[result.data.itemData.assetId] === undefined
              ) {
                updatedDisabledRecord[result.data.itemData.assetId] = {
                  isOwned: true
                } as TItemDisabledReason;
              } else {
                updatedDisabledRecord[result.data.itemData.assetId].isOwned = true;
              }
              updatedOwnershipRecord[result.data.itemData.assetId] = true;
              if (updatedSelectedItems) {
                const index = updatedSelectedItems.indexOf(item);
                if (index > -1) {
                  updatedSelectedItems.splice(index, 1);
                }
              }
            }
          }
        }
      });
      if (updatedSelectedItems) {
        const newSelectedItems = updatedSelectedItems;
        setSelectedItems(newSelectedItems.slice());
      }
      setDisabledItemsRecord(updatedDisabledRecord);
      setOwnershipRecord(updatedOwnershipRecord);
      if (successCount === results.length) {
        window.location.reload();
      }
    },
    [disabledItemsRecord, itemDetail, ownershipRecord, recommendedItemDetails, selectedItems]
  );

  if (
    itemDetail === undefined ||
    recommendedItemDetails === undefined ||
    recommendedItemDetails.length < 1 ||
    selectedItems === undefined ||
    loadFailure
  ) {
    return <div />;
  }
  const purchaseMetadata = new Map<string, string | undefined>();
  return (
    <React.Fragment>
      <div
        className='complimentary-items-recommendations-container layer'
        id='populated-complimentary-items-recommendations'>
        <div className='complimentary-items-carousel-title'>
          <h1 className='font-header-1'>{translate('Heading.BuyItWith')}</h1>
        </div>
        <div className='complimentary-items-carousel'>
          <ComplimentaryItemRecommendationsItemCard
            item={itemDetail}
            selectedItems={selectedItems}
            disabledItemsRecord={disabledItemsRecord}
            onCheckClicked={onCheckClicked}
          />
          <div className='plus-icon-container'>
            <span className='plus-icon' />
          </div>
          {recommendedItemDetails.map((item: TDetailEntry) => {
            return (
              // eslint-disable-next-line react/jsx-key
              <ComplimentaryItemRecommendationsItemCard
                item={item}
                selectedItems={selectedItems}
                disabledItemsRecord={disabledItemsRecord}
                onCheckClicked={onCheckClicked}
              />
            );
          })}
        </div>
        {displayPurchaseButtonLeft && (
          <div className='purchase-container'>
            <span className='purchase-element'>
              <BatchBuyPriceContainer
                items={selectedItems}
                purchaseMetadata={purchaseMetadata}
                onTransactionComplete={onTransactionComplete}
                // using any as a type for systemFeedbackService because we don't have an exported type for ts
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                systemFeedbackService={systemFeedbackService}
              />
            </span>
            <span className='purchase-element price-total'>
              <div className='text-robux-tile'>
                {translate('Label.Total')}
                <span className='icon-robux-16x16' />
                <span className='text-robux-tile'>{getNumberFormat(totalPrice || 0)}</span>
              </div>
            </span>
          </div>
        )}
        {!displayPurchaseButtonLeft && (
          <div className='purchase-container-right'>
            <span className='purchase-element price-total'>
              <div className='text-robux-tile'>
                {translate('Label.Total')}
                <span className='icon-robux-16x16' />
                <span className='text-robux-tile'>{getNumberFormat(totalPrice || 0)}</span>
              </div>
            </span>
            <span className='purchase-element'>
              <BatchBuyPriceContainer
                items={selectedItems}
                purchaseMetadata={purchaseMetadata}
                onTransactionComplete={onTransactionComplete}
                // using any as a type for systemFeedbackService because we don't have an exported type for ts
                systemFeedbackService={systemFeedbackService}
              />
            </span>
          </div>
        )}
      </div>
    </React.Fragment>
  );
};

export default withTranslations(ComplimentaryItemRecommendationsCarousel, translationConfig);
