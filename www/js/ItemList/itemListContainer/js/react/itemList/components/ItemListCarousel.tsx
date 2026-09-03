import React, { useState, useCallback, useEffect } from 'react';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { BatchBuyPriceContainer } from 'roblox-item-purchase';
import {
  ItemDetailsHydrationService,
  TDetailEntry,
  TItemDetailRequestEntry,
  CurrentUser
} from 'Roblox';
import { numberFormat } from 'core-utilities';
import itemListService from '../services/itemListService';
import translationConfig from '../translation.config';
import SelectableItemCard from './SelectableItemCard';
import itemListConstants from '../constants/itemListConstants';
import DefaultBodyItemCard from './DefaultBodyItemCard';
import { TItemCardSource } from '../../analytics/axTrackingEvents';

type TItemListCarouselProps = {
  items: Array<TItemDetailRequestEntry>;
  purchasable: boolean;
  selectable: boolean;
  defaultSelected: boolean;
  backgroundVisualContainer: boolean;
  titleText: string;
  // There isn't a good way to pass down SystemFeedbackService to child components
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  systemFeedbackService: any;
  // eslint-disable-next-line react/require-default-props
  onSelectedItemsChanged?: (
    selectedItems: Array<TDetailEntry>,
    ownershipRecord: Record<string, boolean>
  ) => void;
  // eslint-disable-next-line react/require-default-props
  showDefaultBody?: boolean;
  // eslint-disable-next-line react/require-default-props
  onDefaultBodySelectChanged?: (useDefaultBody: boolean) => void;
  showCreatorName: boolean;
  showPrice: boolean;
  showItemType: boolean;
  checkOwnership?: boolean;
  defaultPermanentTimedOption?: boolean;
  // eslint-disable-next-line react/require-default-props
  itemCardSource?: TItemCardSource;
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
  itemType: string;
  isOwned: boolean;
};

export type TItemDisabledReason = {
  isOwned: boolean;
  noSellers: boolean;
};

export const ItemListCarousel = ({
  items,
  purchasable,
  selectable,
  defaultSelected,
  backgroundVisualContainer,
  titleText,
  onSelectedItemsChanged,
  systemFeedbackService,
  showDefaultBody,
  onDefaultBodySelectChanged,
  showCreatorName,
  showPrice,
  showItemType,
  checkOwnership,
  defaultPermanentTimedOption,
  itemCardSource,
  translate
}: TItemListCarouselProps & WithTranslationsProps): JSX.Element => {
  const [itemDetails, setItemDetails] = useState<Array<TDetailEntry>>();
  const [itemSelection, setItemSelection] = useState<Record<string, boolean>>();
  const [selectedItems, setSelectedItems] = useState<Array<TDetailEntry>>();
  const [disabledItemsRecord, setDisabledItemsRecord] = useState<
    Record<string, TItemDisabledReason>
  >({});
  const [totalPrice, setTotalPrice] = useState<number>();
  const [ownershipRecord, setOwnershipRecord] = useState<Record<string, boolean>>({});
  const [loadFailure, setLoadFailure] = useState<boolean>(false);

  const getItemKey = (id: number, itemType: string) => {
    return `${itemType.toLowerCase()}${id}`;
  };

  const purchaseMetadata = new Map<string, string | undefined>();
  const postItemDetails = useCallback(() => {
    return ItemDetailsHydrationService.getItemDetails(items, false, true);
  }, [items]);

  const getItemOwnership = useCallback(
    async (userId: number, itemType: string, itemTargetId: number) => {
      const response = await itemListService.getItemOwnership(userId, itemType, itemTargetId);
      const result = { response, id: itemTargetId, itemType };
      return result;
    },
    []
  );

  const getPriceForItem = useCallback((item: TDetailEntry | undefined) => {
    if (item?.purchaseInfo?.purchasePrice !== undefined) {
      return item.purchaseInfo.purchasePrice;
    }
    if (item === undefined) {
      return 0;
    }
    if (
      CurrentUser.isPremiumUser &&
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
    if (itemDetails !== undefined) {
      itemDetails.forEach(item => {
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
  }, [disabledItemsRecord, getPriceForItem, itemDetails, selectedItems]);

  const checkOwnershipForItem = useCallback(
    async (itemTargetId: number, itemType: string) => {
      if (!CurrentUser.isAuthenticated) {
        return { id: itemTargetId, itemType, isOwned: false } as TOwnershipResult;
      }
      if (ownershipRecord[getItemKey(itemTargetId, itemType)] !== undefined) {
        return {
          id: itemTargetId,
          itemType,
          isOwned: ownershipRecord[getItemKey(itemTargetId, itemType)]
        } as TOwnershipResult;
      }
      const response = await getItemOwnership(
        parseInt(CurrentUser.userId, 10),
        itemType.toLowerCase() === 'bundle'
          ? itemListConstants.itemTypeConstants.bundle
          : itemListConstants.itemTypeConstants.asset,
        itemTargetId
      );
      if (!response.response.data) {
        return { id: itemTargetId, itemType, isOwned: false } as TOwnershipResult;
      }

      return { id: itemTargetId, itemType, isOwned: true } as TOwnershipResult;
    },
    [getItemOwnership, ownershipRecord]
  );

  async function checkOwnershipForItems() {
    const updatedOwnershipRecord = ownershipRecord;
    const result = await Promise.all(
      items.map(item => checkOwnershipForItem(item.id, item.itemType))
    );
    const newDisabledItems = new Array<TDetailEntry>();
    const newDisabledItemsRecord = disabledItemsRecord;
    const ownedOffsaleItems = new Array<TDetailEntry>();
    result.forEach(itemOwnership => {
      updatedOwnershipRecord[getItemKey(itemOwnership.id, itemOwnership.itemType)] =
        itemOwnership.isOwned;
      let item = undefined as TDetailEntry | undefined;
      if (itemDetails !== undefined) {
        item = itemDetails.find(i => {
          return i.id === itemOwnership.id;
        });
        if (
          newDisabledItemsRecord[getItemKey(itemOwnership.id, itemOwnership.itemType)]?.noSellers &&
          itemOwnership.isOwned
        ) {
          if (item !== undefined) {
            ownedOffsaleItems.push(item);
          }
        }
      }
      if (!itemOwnership.isOwned || !purchasable) {
        return;
      }

      if (item !== undefined) {
        if (item && !item.itemRestrictions.includes(itemListConstants.limited)) {
          newDisabledItems.push(item);
          if (
            newDisabledItemsRecord &&
            newDisabledItemsRecord[getItemKey(itemOwnership.id, itemOwnership.itemType)] ===
              undefined
          ) {
            newDisabledItemsRecord[getItemKey(itemOwnership.id, itemOwnership.itemType)] = {
              isOwned: true
            } as TItemDisabledReason;
          } else {
            newDisabledItemsRecord[
              getItemKey(itemOwnership.id, itemOwnership.itemType)
            ].isOwned = true;
          }
        }
      }
    });

    setOwnershipRecord(updatedOwnershipRecord);
    if (selectedItems) {
      let newSelectedItems = selectedItems;
      newSelectedItems = newSelectedItems.filter(
        item => defaultSelected && !newDisabledItems.includes(item)
      );
      if (!purchasable && defaultSelected) {
        newSelectedItems = newSelectedItems.concat(ownedOffsaleItems);
      }

      setSelectedItems(newSelectedItems.slice());

      if (onSelectedItemsChanged !== undefined) {
        onSelectedItemsChanged(newSelectedItems.slice(), updatedOwnershipRecord);
      }
    }
    setDisabledItemsRecord(newDisabledItemsRecord);
  }

  const onCheckClicked = useCallback(
    (checkedItemId: number, itemType: string) => {
      const itemSelectionModified = {} as Record<string, boolean>;
      Object.assign(itemSelectionModified, itemSelection);
      itemSelectionModified[getItemKey(checkedItemId, itemType)] = !itemSelectionModified[
        getItemKey(checkedItemId, itemType)
      ];

      const newSelectedItems: Array<TDetailEntry> =
        itemDetails !== undefined
          ? itemDetails.filter(
              item =>
                itemSelectionModified[getItemKey(item.id, item.itemType)] &&
                (!disabledItemsRecord[getItemKey(item.id, item.itemType)] ||
                  (!disabledItemsRecord[getItemKey(item.id, item.itemType)].isOwned &&
                    !disabledItemsRecord[getItemKey(item.id, item.itemType)].noSellers) ||
                  (!purchasable &&
                    ownershipRecord[getItemKey(item.id, item.itemType)] &&
                    disabledItemsRecord[getItemKey(item.id, item.itemType)].noSellers))
            )
          : [];
      setItemSelection(itemSelectionModified);
      setSelectedItems(newSelectedItems);
      if (onSelectedItemsChanged !== undefined) {
        onSelectedItemsChanged(newSelectedItems, ownershipRecord);
      }
    },
    [itemSelection, itemDetails, onSelectedItemsChanged, disabledItemsRecord, ownershipRecord]
  );

  useEffect(() => {
    const newItemDetails = Array(items.length) as Array<TDetailEntry>;
    const itemDetailOrder = {} as Record<string, number>;
    for (let count = 0; count < items.length; count++) {
      const item = items[count];
      itemDetailOrder[getItemKey(item.id, item.itemType)] = count;
    }
    postItemDetails()
      .then((detailResponse: Array<TDetailEntry>) => {
        const itemSelectionFromDetails = {} as Record<string, boolean>;
        const updatedDisabledRecord = disabledItemsRecord;
        const updatedSelectedItems = [] as Array<TDetailEntry>;
        detailResponse.forEach(item => {
          const itemPosition = itemDetailOrder[getItemKey(item.id, item.itemType)];
          itemSelectionFromDetails[getItemKey(item.id, item.itemType)] = true;
          newItemDetails[itemPosition] = item;

          if (
            (!item.purchaseInfo?.purchasable && item.lowestPrice === undefined) ||
            (item.isOffSale && !item.hasResellers)
          ) {
            if (
              updatedDisabledRecord &&
              updatedDisabledRecord[getItemKey(item.id, item.itemType)] === undefined
            ) {
              updatedDisabledRecord[getItemKey(item.id, item.itemType)] = {
                noSellers: true
              } as TItemDisabledReason;
            } else {
              updatedDisabledRecord[getItemKey(item.id, item.itemType)].noSellers = true;
            }
          } else if (
            defaultSelected &&
            (!disabledItemsRecord[getItemKey(item.id, item.itemType)] ||
              !disabledItemsRecord[getItemKey(item.id, item.itemType)].isOwned)
          ) {
            updatedSelectedItems.push(item);
          }
        });
        setSelectedItems(updatedSelectedItems);
        setDisabledItemsRecord(updatedDisabledRecord);
        setItemSelection(itemSelectionFromDetails);
        setItemDetails(newItemDetails);

        if (onSelectedItemsChanged !== undefined) {
          onSelectedItemsChanged(updatedSelectedItems, ownershipRecord);
        }
      })
      .catch(() => {
        setLoadFailure(true);
      });
    // Cannot add disabledItemsRecord to the dependency array because it will cause an infinite loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postItemDetails, items]);

  useEffect(() => {
    if (itemDetails && checkOwnership) {
      checkOwnershipForItems().catch(() => {
        setLoadFailure(true);
      });
    }
    // Cannot add checkOwnershipForItems to the dependency array because it will cause an infinite loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemDetails]);

  useEffect(() => {
    if (itemDetails) {
      updateTotalPrice();
    }
  }, [itemDetails, selectedItems, updateTotalPrice]);

  const onTransactionComplete = useCallback(
    (results: Array<Record<string, TPurchaseDataResult>>) => {
      let successCount = 0;
      const updatedOwnershipRecord = ownershipRecord;
      const updatedDisabledRecord = disabledItemsRecord;
      const updatedSelectedItems = selectedItems;
      results.forEach(result => {
        if (itemDetails !== undefined) {
          if (
            result.data.reason === itemListConstants.batchBuyPurchaseResults.success ||
            result.data.reason === itemListConstants.batchBuyPurchaseResults.alreadyOwned
          ) {
            successCount += 1;
            const item = itemDetails.find(i => {
              if (result.data.itemData.bundleId !== undefined) {
                return i.id === result.data.itemData.bundleId;
              }
              return i.id === result.data.itemData.assetId;
            });
            if (item && !item.itemRestrictions.includes(itemListConstants.limited)) {
              let itemType = 'asset';
              let id = result.data.itemData.assetId;
              if (result.data.itemData.bundleId !== undefined) {
                itemType = 'bundle';
                id = result.data.itemData.bundleId;
              }
              if (
                updatedDisabledRecord &&
                updatedDisabledRecord[getItemKey(id, itemType)] === undefined
              ) {
                updatedDisabledRecord[getItemKey(id, itemType)] = {
                  isOwned: true
                } as TItemDisabledReason;
              } else {
                updatedDisabledRecord[getItemKey(id, itemType)].isOwned = true;
              }
              updatedOwnershipRecord[getItemKey(id, itemType)] = true;
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
        // We may want the option to reload the page from a complete transation in the future
        // window.location.reload();
      }
    },
    [disabledItemsRecord, ownershipRecord, itemDetails, selectedItems]
  );
  if (
    itemDetails === undefined ||
    itemDetails.length < 1 ||
    selectedItems === undefined ||
    loadFailure
  ) {
    return <div />;
  }
  return (
    <React.Fragment>
      <div
        className={`item-list-container${backgroundVisualContainer ? ' layer' : ''}`}
        id='populated-item-list'>
        {titleText !== '' && (
          <div className='item-list-carousel-title'>
            <h1 className='font-header-1'>{titleText}</h1>
          </div>
        )}
        <div className='item-list-carousel'>
          <div className='item-list-cards'>
            {itemDetails.map((item: TDetailEntry) => {
              return (
                <SelectableItemCard
                  item={item}
                  itemKey={getItemKey(item.id, item.itemType)}
                  purchasable={purchasable}
                  useCheckbox={selectable}
                  selectedItems={selectedItems}
                  disabledItemsRecord={disabledItemsRecord}
                  ownershipRecord={ownershipRecord}
                  onCheckClicked={onCheckClicked}
                  showCreatorName={showCreatorName}
                  showPrice={showPrice}
                  showItemType={showItemType}
                  defaultPermanentTimedOption={defaultPermanentTimedOption}
                  itemCardSource={itemCardSource}
                  key={item.id}
                />
              );
            })}
            {showDefaultBody && onDefaultBodySelectChanged !== undefined && (
              <DefaultBodyItemCard onDefaultBodySelectChanged={onDefaultBodySelectChanged} />
            )}
          </div>
        </div>
        {purchasable && (
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
                <span className='text-robux-tile'>
                  {numberFormat.getNumberFormat(totalPrice || 0)}
                </span>
              </div>
            </span>
          </div>
        )}
      </div>
    </React.Fragment>
  );
};

export default withTranslations(ItemListCarousel, translationConfig);
