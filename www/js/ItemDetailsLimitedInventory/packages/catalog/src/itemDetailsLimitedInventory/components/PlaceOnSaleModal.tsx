/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useEffect, useCallback, useMemo, useRef } from "react";
import { withTranslations, WithTranslationsProps } from "react-utilities";
import { createModal } from "react-style-guide";
import { authenticatedUser } from "header-scripts";
import translationConfig from "../translation.config";
import { TResellableCopy } from "../containers/ItemDetailsLimitedInventoryContainer";
import { itemDetailsLimitedInventoryService } from "../services/itemDetailsLimitedInventoryService";
import PlaceOnSaleModalBody from "./PlaceOnSaleModalBody";

type TPlaceOnSaleModalProps = {
  collectibleItemData: TResellableCopy | undefined;
  isLimited2: boolean;
  showModal: boolean;
  onPlaceOnSaleActionComplete: (success: boolean | undefined) => void;
  onModalClosed: () => void;
  resalePriceFloor: number;
  recentAveragePrice: number | undefined;
  collectibleResaleFeePercentage: number;
};

export const PlaceOnSaleModal = ({
  collectibleItemData,
  isLimited2,
  showModal,
  onPlaceOnSaleActionComplete,
  onModalClosed,
  resalePriceFloor,
  recentAveragePrice,
  translate,
  collectibleResaleFeePercentage,
}: TPlaceOnSaleModalProps & WithTranslationsProps): JSX.Element | null => {
  // Memoised so the component identity is stable across renders. Called in the render body,
  // createModal() returns a fresh component each time, so any parent re-render while the
  // modal is open unmounts and remounts the body — discarding the price the seller typed.
  // recentAveragePrice arrives from an unawaited fetch and can land after the modal opens.
  const [Modal, modalService] = useMemo(() => createModal(), []);
  // A ref, not a render-local: the body reports the price once per edit, so a value stored
  // per render is lost on the next parent re-render while the dialog is open — the dialog
  // would show the typed price and submit 0.
  const resalePrice = useRef(0);

  const placeLimited2ItemOnSale = useCallback((collectibleItem: TResellableCopy, price: number) => {
    return itemDetailsLimitedInventoryService.placeLimited2ItemOnSale(
      authenticatedUser.id!,
      collectibleItem.collectibleItemId,
      collectibleItem.collectibleInstanceId,
      collectibleItem.collectibleProductId,
      true,
      price,
    );
  }, []);

  const onAction = useCallback(
    async (itemData: TResellableCopy, listPrice: number) => {
      if (listPrice < resalePriceFloor) {
        modalService.close();
        onPlaceOnSaleActionComplete(false);
        return;
      }
      if (!itemData) {
        modalService.close();
        onPlaceOnSaleActionComplete(false);

        return;
      }
      try {
        if (!isLimited2) {
          modalService.close();
          onPlaceOnSaleActionComplete(false);
          return;
        }
        await placeLimited2ItemOnSale(itemData, listPrice);
        modalService.close();
        onPlaceOnSaleActionComplete(true);
      } catch {
        onPlaceOnSaleActionComplete(false);
        modalService.close();
      }
    },
    [
      resalePriceFloor,
      isLimited2,
      modalService,
      onPlaceOnSaleActionComplete,
      placeLimited2ItemOnSale,
    ],
  );

  const onNeutral = () => {
    if (!collectibleItemData) {
      return;
    }
    onPlaceOnSaleActionComplete(undefined);
    modalService.close();
    onModalClosed();
  };

  const onResalePriceChange = (newPrice: number) => {
    resalePrice.current = newPrice;
  };

  useEffect(() => {
    if (collectibleItemData && showModal) {
      modalService.open();
    } else {
      modalService.close();
    }
  }, [collectibleItemData, modalService, showModal]);

  if (!collectibleItemData) {
    return <div />;
  }
  return (
    <Modal
      {...{
        title: translate("Heading.SellItem"),
        body: (
          <PlaceOnSaleModalBody
            collectibleItemData={collectibleItemData}
            isLimited2={isLimited2}
            onResalePriceChange={onResalePriceChange}
            resalePriceFloor={resalePriceFloor}
            recentAveragePrice={recentAveragePrice}
            collectibleResaleFeePercentage={collectibleResaleFeePercentage}
          />
        ),
        neutralButtonText: translate("Action.Cancel"),
        actionButtonText: translate("Action.Sell"),
        onAction: () => {
          onAction(collectibleItemData, resalePrice.current).catch(() => {
            modalService.close();
            onPlaceOnSaleActionComplete(false);
          });
        },
        onNeutral,
        size: "md",
      }}
      actionButtonShow
    />
  );
};

export default withTranslations(PlaceOnSaleModal, translationConfig);
