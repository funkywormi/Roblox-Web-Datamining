/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call */
import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Thumbnail2d,
  ThumbnailTypes,
  ThumbnailFormat,
  DefaultThumbnailSize,
} from "@rbx/thumbnails";
import {
  Button,
  Checkbox,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogTitle,
  Dropdown,
  Menu,
  MenuSection,
  MenuItem,
  Icon,
} from "@rbx/foundation-ui";
import { escapeHtml } from "@rbx/core-scripts/format/string";
import { useFormatter } from "@rbx/www-common/intl";
import { useTranslation } from "@rbx/core-scripts/react";
import { AXSendTrackingActionType } from "@rbx/catalog/analytics/types";
import { TDetailEntry } from "@rbx/catalog/itemDetailsHydrationService/constants/itemDetailsHydrationConstants";
import { getCurrentUserId } from "../../utils/currentUser";
import { sendAXTracking, AXAnalyticsConstants } from "../../utils/axAnalyticsService";
import { getExpiredItemDetails } from "../../services/expiredItemDetails";
import BatchBuyPriceContainer from "@rbx/purchase-common/src/js/react/itemPurchase/components/BatchBuyPriceContainer";
import { Asset } from "../../avatar.types";
import AvatarAPIService from "../../services/avatarAPIService";
import { getCatalogItemUrl } from "../../utils/assetManager.helpers";
import { avatarConstants } from "../../constants/avatarConstants";

// This flow only ever repurchases expired items, so "limited" must include
// Limited 2.0 (Collectible) items, whose itemRestrictions carry "Collectible"
// rather than "Limited"/"LimitedUnique".
const isAssetLimited = (details?: TDetailEntry): boolean => {
  const restrictions = details?.itemRestrictions;
  return (
    !!restrictions &&
    (restrictions.includes("LimitedUnique") ||
      restrictions.includes("Limited") ||
      restrictions.includes("Collectible"))
  );
};

// Purchases here are always repurchases of an expired entitlement; the click
// and success events surface the flow (source/purchaseType) alongside per-item
// metadata so they can be sliced like the other marketplace purchase events.
const EXPIRED_REPURCHASE_SOURCE = "AvatarEditorExpiredItems";
const EXPIRED_REPURCHASE_PURCHASE_TYPE = "avatar-editor-expired-repurchase";
// Grace period before reloading so fire-and-forget EventStream purchase-success
// beacons have a chance to leave the page before it unloads.
const REPURCHASE_RELOAD_DELAY_MS = 250;

type TBatchPurchaseItem = {
  id: number;
  itemType: string;
  timedOption?: TimedOption;
};

export type TimedOption = {
  days: number;
  price: number;
  selected?: boolean;
};

// Extended TDetailEntry type to include timedOptions
type TDetailEntryWithTimedOptions = TDetailEntry & {
  timedOptions?: TimedOption[];
};

export type ExpiredItemSelection = {
  assetId: number;
  selectedTimedOption?: TimedOption;
};

type ExpiredItemsDialogProps = {
  closeDialog: () => void;
  isOpen: boolean;
  expiredAssets: Asset[];
  onRepurchase?: (selections: ExpiredItemSelection[]) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  systemFeedbackService?: any;
};

// Extract timed options from item details, with the first option selected by default
function getTimedOptionsFromDetails(
  details: TDetailEntryWithTimedOptions | undefined,
): TimedOption[] {
  if (!details?.timedOptions || details.timedOptions.length === 0) {
    return [];
  }

  // Check if any option is already marked as selected
  const hasSelectedOption = details.timedOptions.some(opt => opt.selected);

  return details.timedOptions.map((option, index) => ({
    ...option,
    // If no option is selected, select the first one by default
    selected: hasSelectedOption ? option.selected : index === 0,
  }));
}

function ExpiredItemsDialog({
  closeDialog,
  isOpen,
  expiredAssets,
  onRepurchase,
  systemFeedbackService,
}: ExpiredItemsDialogProps): JSX.Element {
  const { translate } = useTranslation();
  const formatter = useFormatter();
  const [itemDetails, setItemDetails] = useState<TDetailEntry[]>([]);
  // Track selected timed options per asset: { [assetId]: TimedOption[] }
  const [assetTimedOptions, setAssetTimedOptions] = useState<Record<number, TimedOption[]>>({});
  // Track which items are selected for repurchase: { [assetId]: boolean }
  const [selectedItems, setSelectedItems] = useState<Record<number, boolean>>({});
  // Track user's current Robux balance
  const [userBalance, setUserBalance] = useState<number | null>(null);

  // Fetch user currency when dialog opens
  useEffect(() => {
    if (isOpen) {
      AvatarAPIService.getUserCurrency(getCurrentUserId())
        .then(response => {
          setUserBalance(response.robux);
        })
        .catch(() => {
          // Error handled silently - balance won't be shown
          setUserBalance(null);
        });
    }
  }, [isOpen]);

  useEffect(() => {
    if (expiredAssets.length === 0) {
      setItemDetails([]);
      setAssetTimedOptions({});
      setSelectedItems({});
      return;
    }

    // Initialize all items as selected by default
    const initialSelectedItems: Record<number, boolean> = {};
    expiredAssets.forEach(asset => {
      initialSelectedItems[asset.id] = true;
    });
    setSelectedItems(initialSelectedItems);

    getExpiredItemDetails(expiredAssets.map(asset => asset.id))
      .then(detailEntries => {
        setItemDetails(detailEntries);

        // Initialize timed options from the fetched item details
        const initialTimedOptions: Record<number, TimedOption[]> = {};
        detailEntries.forEach(detail => {
          const detailWithTimedOptions = detail as TDetailEntryWithTimedOptions;
          const options = getTimedOptionsFromDetails(detailWithTimedOptions);
          if (options.length > 0) {
            initialTimedOptions[detail.id] = options;
          }
        });
        setAssetTimedOptions(initialTimedOptions);
      })
      .catch(() => {
        if (systemFeedbackService?.error) {
          systemFeedbackService.error(avatarConstants.assets.couldNotLoadList);
        }
      });
  }, [expiredAssets, systemFeedbackService]);

  // Create a lookup map for item details by id
  const itemDetailsMap = useMemo(() => {
    return itemDetails.reduce<Record<number, TDetailEntry>>((acc, detail) => {
      acc[detail.id] = detail;
      return acc;
    }, {});
  }, [itemDetails]);

  const handleTimedOptionChange = useCallback((assetId: number, selectedDays: number) => {
    setAssetTimedOptions(prev => {
      const options = prev[assetId];
      if (!options) return prev;

      const updatedOptions = options.map(option => ({
        ...option,
        selected: option.days === selectedDays,
      }));

      return {
        ...prev,
        [assetId]: updatedOptions,
      };
    });
  }, []);

  const getSelectedOption = useCallback(
    (assetId: number): TimedOption | undefined => {
      const options = assetTimedOptions[assetId];
      if (!options) return undefined;
      return options.find(opt => opt.selected) || options[0];
    },
    [assetTimedOptions],
  );

  // Resolve the price to charge/display for an asset. When the item has timed
  // options, use the selected option's price. Otherwise (e.g. the creator
  // removed the timed options and it's now a permanent-only item), fall back to
  // the item's permanent price instead of 0.
  const getAssetPrice = useCallback(
    (assetId: number): number => {
      const selectedOption = getSelectedOption(assetId);
      if (selectedOption) {
        return selectedOption.price;
      }
      return itemDetailsMap[assetId]?.price ?? 0;
    },
    [getSelectedOption, itemDetailsMap],
  );

  // Toggle item selection for repurchase
  const handleItemCheckboxChange = useCallback((assetId: number) => {
    setSelectedItems(prev => ({
      ...prev,
      [assetId]: !prev[assetId],
    }));
  }, []);

  // Get list of selected assets
  const selectedAssets = useMemo((): Asset[] => {
    return expiredAssets.filter(asset => selectedItems[asset.id]);
  }, [expiredAssets, selectedItems]);

  // Get total count of selected items
  const getSelectedCount = useCallback((): number => {
    return selectedAssets.length;
  }, [selectedAssets]);

  // Get total price of selected items only
  const getTotalPrice = useCallback((): number => {
    return selectedAssets.reduce((total, asset) => {
      return total + getAssetPrice(asset.id);
    }, 0);
  }, [selectedAssets, getAssetPrice]);

  // Calculate remaining balance after transaction
  const remainingBalance = useMemo(() => {
    if (userBalance === null) return null;
    return Math.max(0, userBalance - getTotalPrice());
  }, [userBalance, getTotalPrice]);

  // Parse items for BatchBuyPriceContainer
  const parseItemsForBatchPurchase = useCallback((): TBatchPurchaseItem[] => {
    return selectedAssets.map(asset => {
      const selectedOption = getSelectedOption(asset.id);
      // Only pass timedOption for rentals (days > 0), not for permanent purchases
      const timedOption = selectedOption && selectedOption.days > 0 ? selectedOption : undefined;
      return {
        id: asset.id,
        itemType: "Asset",
        timedOption,
      };
    });
  }, [selectedAssets, getSelectedOption]);

  // Purchase button click event. Mirrors the marketplace purchase-click
  // metadata so the expired-item repurchase click can be sliced like the
  // others (per-item type/subType/price/isLimited/isTimedOptionPurchase).
  const onBuyButtonClick = useCallback(() => {
    if (!AXAnalyticsConstants.PurchaseButtonClick) {
      return;
    }
    const transactionItems = selectedAssets.map(asset => {
      const details = itemDetailsMap[asset.id];
      const selectedOption = getSelectedOption(asset.id);
      return {
        itemType: details?.itemType ?? "Asset",
        subType: details?.assetType,
        itemId: asset.id,
        price: selectedOption?.price ?? details?.price ?? 0,
        isLimited: isAssetLimited(details),
        isTimedOptionPurchase: !!selectedOption && selectedOption.days > 0,
      };
    });
    sendAXTracking({
      itemName: AXAnalyticsConstants.PurchaseButtonClick,
      actionType: AXSendTrackingActionType.Click,
      metaData: {
        metaData: JSON.stringify({
          source: EXPIRED_REPURCHASE_SOURCE,
          totalTransactionValue: getTotalPrice(),
          transactionItems: JSON.stringify(transactionItems),
          purchaseType: EXPIRED_REPURCHASE_PURCHASE_TYPE,
          userId: getCurrentUserId(),
        }),
      },
    });
  }, [selectedAssets, itemDetailsMap, getSelectedOption, getTotalPrice]);

  // Fires AX purchase-success events for the successful repurchases before the
  // page reloads: one aggregate PurchaseSuccess, plus a per-item
  // PurchaseSuccessTimedOptionRepurchase for each timed option (days > 0).
  const trackRepurchaseSuccess = useCallback(
    (successfulPurchases: Record<string, unknown>[]) => {
      let totalTransactionValue = 0;
      const purchasedItems: Record<string, unknown>[] = [];

      successfulPurchases.forEach(result => {
        const data = result?.data as Record<string, unknown> | undefined;
        const itemData = data?.itemData as Record<string, unknown> | undefined;
        const assetId = itemData?.assetId as number | undefined;
        if (assetId === undefined) {
          return;
        }
        const details = itemDetailsMap[assetId];
        const selectedOption = getSelectedOption(assetId);
        const price = selectedOption?.price ?? details?.price ?? 0;
        const isTimedOptionPurchase = !!selectedOption && selectedOption.days > 0;
        totalTransactionValue += price;
        purchasedItems.push({
          itemType: details?.itemType ?? "Asset",
          subType: details?.assetType,
          itemId: assetId,
          price,
          isLimited: isAssetLimited(details),
          isTimedOptionPurchase,
        });

        if (isTimedOptionPurchase && AXAnalyticsConstants.PurchaseSuccessTimedOptionRepurchase) {
          sendAXTracking({
            itemName: AXAnalyticsConstants.PurchaseSuccessTimedOptionRepurchase,
            metaData: {
              metaData: JSON.stringify({
                itemId: assetId,
                itemType: details?.itemType ?? "Asset",
                subType: details?.assetType,
                isLimited: isAssetLimited(details),
                isTimedOptionPurchase,
                rentalOptionDays: selectedOption?.days,
              }),
              totalValue: price,
            },
            actionType: AXSendTrackingActionType.Click,
          });
        }
      });

      if (AXAnalyticsConstants.PurchaseSuccess) {
        sendAXTracking({
          itemName: AXAnalyticsConstants.PurchaseSuccess,
          counterName: AXAnalyticsConstants.PurchaseSuccessAsset,
          metaData: {
            metaData: JSON.stringify({
              totalTransactionValue,
              transactionItems: JSON.stringify(purchasedItems),
              purchaseType: EXPIRED_REPURCHASE_PURCHASE_TYPE,
              userId: getCurrentUserId(),
            }),
            totalValue: totalTransactionValue,
          },
          actionType: AXSendTrackingActionType.Click,
        });
      }
    },
    [itemDetailsMap, getSelectedOption],
  );

  // Handle transaction completion
  const onTransactionComplete = useCallback(
    (results: Record<string, unknown>[]) => {
      // Check if any purchases succeeded
      const successfulPurchases = results.filter(result => {
        const data = result?.data as Record<string, unknown> | undefined;
        return data?.reason === "Success";
      });

      if (successfulPurchases.length > 0) {
        trackRepurchaseSuccess(successfulPurchases);
        // Not needed currently as we reload the page after the transaction is complete
        // window.dispatchEvent(new CustomEvent(`navigation-update-user-currency`));
        // The AX purchase-success events above are sent through EventStream, which
        // is fire-and-forget and not navigation-safe (see core-scripts event-stream
        // TODO). Reloading synchronously here would cancel the in-flight beacons, so
        // defer the reload briefly to give them a chance to flush.
        window.setTimeout(() => {
          window.location.reload();
        }, REPURCHASE_RELOAD_DELAY_MS);
        return;
      }

      // Call the optional onRepurchase callback with selections
      if (onRepurchase) {
        const selections: ExpiredItemSelection[] = selectedAssets.map(asset => ({
          assetId: asset.id,
          selectedTimedOption: getSelectedOption(asset.id),
        }));
        onRepurchase(selections);
      }
      closeDialog();
    },
    [selectedAssets, getSelectedOption, onRepurchase, closeDialog, trackRepurchaseSuccess],
  );

  // Empty metadata map for purchase
  const purchaseMetadata = useMemo(() => new Map<string, string | undefined>(), []);

  const formatTimedOptionLabel = (days: number): string => {
    if (days === 0) {
      return translate("Label.Permanent") || "Permanent";
    }
    return translate("Label.TimedOptionDays", { days: days.toString() }) || `${days} days`;
  };

  const isSingleItem = expiredAssets.length === 1;

  return (
    <Dialog
      open={!!isOpen}
      onOpenChange={nextOpen => {
        if (!nextOpen) closeDialog();
      }}
      size="Medium"
      isModal
      hasCloseAffordance
      closeLabel={translate("Action.Close")}
    >
      <DialogContent
        className="expired-items-dialog"
        overlayClassName="expired-items-dialog-overlay"
      >
        <DialogBody className="flex flex-col gap-small">
          <DialogTitle className="text-title-medium content-emphasis">
            {isSingleItem
              ? translate("Heading.BuyItem") || "Buy Item"
              : translate("Title.TimedOptionsExpiredModalTitle", {
                  number: expiredAssets.length.toString(),
                }) || `${expiredAssets.length} Expired items on this avatar`}
          </DialogTitle>
          {!isSingleItem && (
            <span className="text-body-medium content-default">
              {translate("Body.TimedOptionsExpiredItemsBody") ||
                "Buy these items again to use them"}
            </span>
          )}
          {expiredAssets.length > 0 && (
            <div className={`expired-items-list${isSingleItem ? " single-item" : ""}`}>
              {expiredAssets.map(asset => {
                const details = itemDetailsMap[asset.id];
                const itemName = details?.name || asset.name;
                const creatorName = details?.creatorName;
                const timedOptions = assetTimedOptions[asset.id] || [];
                const selectedOption = getSelectedOption(asset.id);
                const displayPrice = getAssetPrice(asset.id);

                // When the item offers exactly one rental (timed) option, replace
                // the dropdown with two toggle buttons: "Buy" (permanent) and
                // "Rent" (the single rental option). Multiple options keep the
                // dropdown.
                const permanentOption = timedOptions.find(option => option.days === 0);
                const rentalOptions = timedOptions.filter(option => option.days > 0);
                const singleRentalOption = rentalOptions.length === 1 ? rentalOptions[0] : null;
                const twoButtonTimedOptions =
                  singleRentalOption && permanentOption
                    ? { permanent: permanentOption, rental: singleRentalOption }
                    : null;

                const isItemSelected = selectedItems[asset.id] ?? false;

                return (
                  <div key={asset.id} className="expired-item-container">
                    <div className="expired-item">
                      <div
                        className="thumbnail-container"
                        onClick={
                          isSingleItem
                            ? undefined
                            : () => {
                                handleItemCheckboxChange(asset.id);
                              }
                        }
                        aria-hidden="true"
                      >
                        <Thumbnail2d
                          type={ThumbnailTypes.assetThumbnail}
                          size={DefaultThumbnailSize}
                          targetId={asset.id}
                          containerClass="expired-item-thumb"
                          format={ThumbnailFormat.webp}
                          altName={
                            (itemName || "Expired Item") + (creatorName ? ` by ${creatorName}` : "")
                          }
                        />
                      </div>
                      {!isSingleItem && (
                        <div className="purchase-checkbox-container">
                          <Checkbox
                            size="Small"
                            placement="End"
                            isChecked={isItemSelected}
                            onCheckedChange={() => {
                              handleItemCheckboxChange(asset.id);
                            }}
                            aria-label={translate("Action.Select") || "Select item"}
                          />
                        </div>
                      )}
                      <div className="item-details-container">
                        <a
                          href={getCatalogItemUrl(asset.id, itemName || "")}
                          target="_self"
                          className="item-name"
                        >
                          {itemName}
                        </a>
                        {twoButtonTimedOptions && (
                          <div className="expired-item-timed-options-toggle">
                            <button
                              type="button"
                              className={`timed-option-toggle-btn ${
                                (selectedOption?.days ?? 0) === 0 ? "selected" : ""
                              }`}
                              aria-pressed={(selectedOption?.days ?? 0) === 0}
                              onClick={() => {
                                handleTimedOptionChange(asset.id, 0);
                              }}
                            >
                              <span className="timed-option-toggle-label">
                                {translate("Action.Buy") || "Buy"}
                              </span>
                              <span className="timed-option-toggle-price">
                                <Icon name="icon-filled-robux" size="Small" />
                                <span className="timed-option-toggle-price-text">
                                  {formatter.number(twoButtonTimedOptions.permanent.price)}
                                </span>
                              </span>
                            </button>
                            <button
                              type="button"
                              className={`timed-option-toggle-btn ${
                                selectedOption?.days === twoButtonTimedOptions.rental.days
                                  ? "selected"
                                  : ""
                              }`}
                              aria-pressed={
                                selectedOption?.days === twoButtonTimedOptions.rental.days
                              }
                              onClick={() => {
                                handleTimedOptionChange(
                                  asset.id,
                                  twoButtonTimedOptions.rental.days,
                                );
                              }}
                            >
                              <span className="timed-option-toggle-label">
                                {translate("Action.Rent") || "Rent"}
                              </span>
                              <span className="timed-option-toggle-price">
                                <Icon name="icon-filled-robux" size="Small" />
                                <span className="timed-option-toggle-price-text">
                                  {formatter.number(twoButtonTimedOptions.rental.price)}
                                </span>
                              </span>
                            </button>
                          </div>
                        )}
                        {timedOptions.length > 0 && !twoButtonTimedOptions && (
                          <Dropdown
                            size="Small"
                            className="expired-item-timed-options-dropdown"
                            value={(selectedOption?.days || 0).toString()}
                            placeholder={formatTimedOptionLabel(selectedOption?.days || 0)}
                            onValueChange={value => {
                              const selectedDays = parseInt(value, 10);
                              handleTimedOptionChange(asset.id, selectedDays);
                            }}
                          >
                            <Menu className="timed-options-dropdown-menu">
                              <MenuSection className="timed-options-dropdown-menu-section">
                                {timedOptions.map(timedOption => (
                                  <MenuItem
                                    key={timedOption.days}
                                    value={timedOption.days.toString()}
                                    title={formatTimedOptionLabel(timedOption.days)}
                                    trailing={
                                      <span className="dropdown-robux-container">
                                        <Icon name="icon-filled-robux" size="Small" />
                                        <span className="dropdown-robux-text">
                                          {formatter.number(timedOption.price)}
                                        </span>
                                      </span>
                                    }
                                  />
                                ))}
                              </MenuSection>
                            </Menu>
                          </Dropdown>
                        )}
                        <div className="item-price-container">
                          <span className="icon-robux-16x16" />
                          <span className="item-price">{formatter.number(displayPrice)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </DialogBody>
        <DialogFooter>
          <div className="expired-items-footer">
            {!isSingleItem && (
              <div className="total-row">
                <span className="total-label">
                  {translate("Label.TryOnManagerDescriptor", {
                    numItems: getSelectedCount().toString(),
                  }) || `Total: ${getSelectedCount()} items`}
                </span>
                <div className="total-price-container">
                  <span className="icon-robux-16x16" />
                  <span className="total-price">{formatter.number(getTotalPrice())}</span>
                </div>
              </div>
            )}
            <div className="action-buttons">
              {getSelectedCount() > 0 && systemFeedbackService ? (
                <BatchBuyPriceContainer
                  items={parseItemsForBatchPurchase()}
                  purchaseMetadata={purchaseMetadata}
                  onBuyButtonClick={onBuyButtonClick}
                  onTransactionComplete={onTransactionComplete}
                  systemFeedbackService={systemFeedbackService}
                />
              ) : (
                <Button variant="Emphasis" size="Medium" isDisabled>
                  {translate("Action.Buy") || "Buy"}
                </Button>
              )}
              <Button variant="Standard" size="Medium" onClick={closeDialog}>
                {translate("Action.Cancel") || "Cancel"}
              </Button>
            </div>
            {remainingBalance !== null && (
              <div
                className="balance-disclaimer"
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{
                  __html:
                    translate("Label.YourBalanceAfterTransaction", {
                      remainingBalance: `<span class='icon-robux-16x16'></span><span class='text-robux'>${escapeHtml(formatter.number(remainingBalance))}</span>`,
                    }) ||
                    `Your balance after this transaction will be <span class='icon-robux-16x16'></span><span class='text-robux'>${escapeHtml(formatter.number(remainingBalance))}</span>`,
                }}
              />
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ExpiredItemsDialog;
