import React, { useState, useCallback, useEffect } from "react";
import { createSystemFeedback } from "react-style-guide";
import { authenticatedUser } from "header-scripts";
import { withTranslations, WithTranslationsProps } from "react-utilities";
import {
  ItemDetailsHydrationService,
  AvatarAccoutrementService,
} from "@rbx/legacy-webapp-types/Roblox";
import ItemDetailsLimitedInventoryRow from "../components/ItemDetailsLimitedInventoryRow";
import {
  itemDetailsLimitedInventoryService,
  TL2ResellableCopy,
  TLimited2ResaleParameters,
} from "../services/itemDetailsLimitedInventoryService";
import translationConfig from "../translation.config";
import PlaceOnSaleModal from "../components/PlaceOnSaleModal";
import TakeOffSaleModal from "../components/TakeOffSaleModal";
import ResaleRestriction from "../constants/resaleRestrictionConstants";
import { trackError } from "../../observability";

type TItemDetailsLimitedInventoryContainerProps = {
  itemId: number;
  isBundle: boolean;
};

export type TResellableCopy = {
  userAssetId: number | undefined;
  collectibleInstanceId: string | undefined;
  collectibleItemId: string | undefined;
  collectibleProductId: string | undefined;
  serialNumber: number | undefined;
  price: number | undefined;
  buyPrice: number | undefined;
  isInHolding: boolean;
  creatorTargetId: number;
};

export enum ItemStatus {
  onSale,
  offSale,
  holding,
}

const [SystemFeedback, systemFeedbackService] = createSystemFeedback();

export const ItemDetailsLimitedInventoryContainer = ({
  itemId,
  isBundle,
  translate,
}: TItemDetailsLimitedInventoryContainerProps & WithTranslationsProps): JSX.Element | null => {
  const [resellableCopies, setResellableCopies] = useState<Array<TResellableCopy>>([]);
  const [itemInHold, setItemInHold] = useState<boolean>(false);
  const [itemSellable, setItemSellable] = useState<boolean>(false);
  const [currentCollectibleItem, setCurrentCollectibleItem] = useState<TResellableCopy>();
  const [showPlaceOnSaleModal, setShowPlaceOnSaleModal] = useState<boolean>(false);
  const [showTakeOffSaleModal, setShowTakeOffSaleModal] = useState<boolean>(false);
  const [itemName, setItemName] = useState<string | undefined>();
  const [creatorId, setCreatorId] = useState<number>(0);
  const [creatorType, setCreatorType] = useState<string>("");
  const [collectibleItemId, setCollectibleItemId] = useState<string | undefined>();
  const [isLimited2, setIsLimited2] = useState<boolean>(false);
  const [resaleRestriction, setResaleRestriction] = useState<number>(ResaleRestriction.NONE);
  const [resalePriceFloor, setResalePriceFloor] = useState<number>(1);
  const [collectibleResaleFee, setCollectibleResaleFee] = useState<number>(30);
  const [recentAveragePrice, setRecentAveragePrice] = useState<number | undefined>();

  const getLimited2ResaleParameters = useCallback((currentCollectibleItemId: string) => {
    return itemDetailsLimitedInventoryService.getLimited2ResaleParameters(currentCollectibleItemId);
  }, []);

  const loadRecentAveragePrice = useCallback(
    async (assetId: number, currentCollectibleItemId: string | undefined) => {
      const result = currentCollectibleItemId
        ? await itemDetailsLimitedInventoryService.getLimited2ResaleData(currentCollectibleItemId)
        : await itemDetailsLimitedInventoryService.getLimited1ResaleData(assetId);
      setRecentAveragePrice(result?.data?.recentAveragePrice ?? undefined);
    },
    [],
  );

  const postItemDetails = useCallback(() => {
    return ItemDetailsHydrationService.getItemDetails(
      [{ id: itemId, itemType: isBundle ? "bundle" : "asset" }],
      undefined,
      true,
    );
  }, []);

  const getLimited2ItemsOwned = useCallback(
    (userId: number, collectibleItemData: string, cursor: string | undefined) => {
      return itemDetailsLimitedInventoryService.getLimited2CopiesOwned(
        userId,
        collectibleItemData,
        500,
        cursor,
      );
    },
    [],
  );

  const parseL2ResellableCopy = useCallback((resellableCopy: TL2ResellableCopy) => {
    const parsedResellableCopy = {} as TResellableCopy;
    parsedResellableCopy.collectibleInstanceId = resellableCopy.collectibleInstanceId;
    parsedResellableCopy.collectibleItemId = resellableCopy.collectibleItemId;
    parsedResellableCopy.collectibleProductId = resellableCopy.collectibleProductId;
    parsedResellableCopy.serialNumber = resellableCopy.serialNumber;
    parsedResellableCopy.price = resellableCopy.price;
    if (resellableCopy.saleState === "OffSale") {
      parsedResellableCopy.price = undefined;
    }
    if (resellableCopy.isHeld) {
      parsedResellableCopy.isInHolding = true;
      setItemInHold(true);
    } else {
      setItemSellable(true);
    }
    return parsedResellableCopy;
  }, []);

  const getAssetPriceFloor = (assetTypeId: number, data: TLimited2ResaleParameters) => {
    switch (assetTypeId) {
      case 46:
        return data.resellableLimitedItemPriceFloors.BackAccessory.priceFloor;
      case 72:
        return data.resellableLimitedItemPriceFloors.DressSkirtAccessory.priceFloor;
      case 42:
        return data.resellableLimitedItemPriceFloors.FaceAccessory.priceFloor;
      case 45:
        return data.resellableLimitedItemPriceFloors.FrontAccessory.priceFloor;
      case 41:
        return data.resellableLimitedItemPriceFloors.HairAccessory.priceFloor;
      case 8:
        return data.resellableLimitedItemPriceFloors.Hat.priceFloor;
      case 67:
        return data.resellableLimitedItemPriceFloors.JacketAccessory.priceFloor;
      case 43:
        return data.resellableLimitedItemPriceFloors.NeckAccessory.priceFloor;
      case 66:
        return data.resellableLimitedItemPriceFloors.PantsAccessory.priceFloor;
      case 65:
        return data.resellableLimitedItemPriceFloors.ShirtAccessory.priceFloor;
      case 69:
        return data.resellableLimitedItemPriceFloors.ShortsAccessory.priceFloor;
      case 44:
        return data.resellableLimitedItemPriceFloors.ShoulderAccessory.priceFloor;
      case 68:
        return data.resellableLimitedItemPriceFloors.SweaterAccessory.priceFloor;
      case 64:
        return data.resellableLimitedItemPriceFloors.TShirtAccessory.priceFloor;
      case 47:
        return data.resellableLimitedItemPriceFloors.WaistAccessory.priceFloor;
      default:
        return 0;
    }
  };

  const getBundlePriceFloor = (bundleTypeId: number, data: TLimited2ResaleParameters) => {
    switch (bundleTypeId) {
      case 1:
        return data.resellableLimitedItemPriceFloors.Body.priceFloor;
      case 2:
        return data.resellableLimitedItemPriceFloors.DynamicHead.priceFloor;
      default:
        return 0;
    }
  };

  const getCopiesOwnedForItem = useCallback(async () => {
    const detailResult = await postItemDetails();
    setResaleRestriction(
      detailResult[0].collectibleItemDetails
        ? detailResult[0].collectibleItemDetails.resaleRestriction
        : ResaleRestriction.NONE,
    );
    const hydratedCollectibleItemId = detailResult[0].collectibleItemId;
    const hydratedItemName = detailResult[0].name;
    const hydratedCreatorId = detailResult[0].creatorTargetId;
    const hydratedIsLimited2 = hydratedCollectibleItemId !== undefined;
    setCreatorId(hydratedCreatorId);
    setCreatorType(detailResult[0].creatorType);
    setIsLimited2(hydratedIsLimited2);
    if (hydratedCollectibleItemId) {
      setCollectibleItemId(hydratedCollectibleItemId);
    }
    setItemName(hydratedItemName);
    // Not awaited: the copies-owned list is what renders first, and RAP is only needed
    // once the seller opens the modal. Without it the modal simply omits the warning.
    // Skipped for a limited1 bundle: the limited1 endpoint is keyed by asset ID, and
    // `itemId` is a bundle ID here — separate namespaces, so it would either 4xx or, worse,
    // collide with an unrelated asset and threshold against the wrong item's RAP.
    if (!isBundle || hydratedCollectibleItemId) {
      loadRecentAveragePrice(itemId, hydratedCollectibleItemId).catch(() => {
        setRecentAveragePrice(undefined);
      });
    }
    if (!hydratedCollectibleItemId) {
      setResellableCopies([]);
      return;
    }

    const limited2ResaleParametersResult =
      await getLimited2ResaleParameters(hydratedCollectibleItemId);
    setCollectibleResaleFee(limited2ResaleParametersResult.data.resalePercentageFee);
    if (limited2ResaleParametersResult) {
      setResalePriceFloor(limited2ResaleParametersResult.data.priceFloor);
    }
    const result = await getLimited2ItemsOwned(
      authenticatedUser.id!,
      hydratedCollectibleItemId,
      undefined,
    );
    if (result) {
      const newResellableCopies = [] as Array<TResellableCopy>;
      result.data.itemInstances.forEach(copy => {
        newResellableCopies.push(parseL2ResellableCopy(copy));
      });
      setResellableCopies(newResellableCopies);
    }
  }, []);

  const onButtonAction = (collectibleItemData: TResellableCopy, itemStatus: ItemStatus) => {
    if (itemStatus === ItemStatus.offSale) {
      setCurrentCollectibleItem(collectibleItemData);
      setShowPlaceOnSaleModal(true);
    } else if (itemStatus === ItemStatus.onSale) {
      setCurrentCollectibleItem(collectibleItemData);
      setShowTakeOffSaleModal(true);
    }
  };

  const onPutOnSaleModalClose = () => {
    setShowPlaceOnSaleModal(false);
  };
  const onTakeOffSaleModalClose = () => {
    setShowTakeOffSaleModal(false);
  };
  const onPlaceOnSaleActionComplete = useCallback((success: boolean | undefined) => {
    if (success) {
      systemFeedbackService.success(translate("Response.PlacedOnSaleSuccess"));
      getCopiesOwnedForItem().catch((error: unknown) => {
        trackError("LimitedInventoryLoadFailed", null, error);
        window.location.reload();
      });
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-boolean-literal-compare -- kept explicit: a plain `else` would also fire for a caller passing undefined, which today shows nothing
    } else if (success === false) {
      systemFeedbackService.warning(translate("Response.PlacedOnSaleFailure"));
    }
    setShowPlaceOnSaleModal(false);
  }, []);

  const onTakeOffSaleActionComplete = useCallback((success: boolean | undefined) => {
    if (success) {
      systemFeedbackService.success(translate("Response.TakenOffSaleSuccess"));
      getCopiesOwnedForItem().catch((error: unknown) => {
        trackError("LimitedInventoryLoadFailed", null, error);
        window.location.reload();
      });
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-boolean-literal-compare -- kept explicit: a plain `else` would also fire for a caller passing undefined, which today shows nothing
    } else if (success === false) {
      systemFeedbackService.warning(translate("Response.TakenOffSaleFailure"));
    }
    setShowTakeOffSaleModal(false);
  }, []);

  useEffect(() => {
    getCopiesOwnedForItem().catch((error: unknown) => {
      trackError("LimitedInventoryLoadFailed", null, error);
      setResellableCopies([]);
    });
  }, []);

  if (isLimited2 && collectibleItemId === undefined) {
    return <div />;
  }

  return (
    <React.Fragment>
      <SystemFeedback />
      <div className="item-details-limited-inventory">
        <span className="font-header-1">
          {translate("Label.ItemOwnedCount", { itemCount: resellableCopies.length })}
        </span>
        {!authenticatedUser.isPremiumUser &&
          itemSellable &&
          resaleRestriction !== ResaleRestriction.DISABLED && (
            <span className="premium-only-tooltip">
              <span className="font-caption-body text">{translate("Label.PremiumForResell")}</span>
            </span>
          )}
        {resellableCopies?.length ? (
          resellableCopies.map(collectibleItemData => (
            <ItemDetailsLimitedInventoryRow
              key={collectibleItemData.collectibleInstanceId}
              collectibleItemData={collectibleItemData}
              itemName={itemName}
              isLimited2={isLimited2}
              isFirstItem={collectibleItemData === resellableCopies[0]}
              onButtonAction={onButtonAction}
              resaleRestriction={resaleRestriction}
            />
          ))
        ) : (
          <span className="item-details-limited-inventory-empty-text">
            <span className="text">{translate("Response.NoItemsFound")}</span>
          </span>
        )}
        {false && (
          <button className="btn-control-sm see-more-resellers" type="button">
            {translate("Action.SeeMoreReseller", { linkStart: "", resellerLink: "", linkEnd: "" })}
          </button>
        )}
        <PlaceOnSaleModal
          collectibleItemData={currentCollectibleItem}
          isLimited2={isLimited2}
          showModal={showPlaceOnSaleModal}
          resalePriceFloor={resalePriceFloor}
          recentAveragePrice={recentAveragePrice}
          onPlaceOnSaleActionComplete={onPlaceOnSaleActionComplete}
          onModalClosed={onPutOnSaleModalClose}
          collectibleResaleFeePercentage={collectibleResaleFee}
        />
        <TakeOffSaleModal
          collectibleItemData={currentCollectibleItem}
          isLimited2={isLimited2}
          showModal={showTakeOffSaleModal}
          onTakeOffSaleActionComplete={onTakeOffSaleActionComplete}
          onModalClosed={onTakeOffSaleModalClose}
        />
      </div>
    </React.Fragment>
  );
};

export default withTranslations(ItemDetailsLimitedInventoryContainer, translationConfig);
