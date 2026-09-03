/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useEffect, useCallback } from 'react';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { createModal } from 'react-style-guide';
import { authenticatedUser } from 'header-scripts';
import translationConfig from '../translation.config';
import { TResellableCopy } from '../containers/ItemDetailsLimitedInventoryContainer';
import { itemDetailsLimitedInventoryService } from '../services/itemDetailsLimitedInventoryService';
import PlaceOnSaleModalBody from './PlaceOnSaleModalBody';

type TPlaceOnSaleModalProps = {
  collectibleItemData: TResellableCopy | undefined;
  itemId: number;
  isLimited2: boolean;
  showModal: boolean;
  onPlaceOnSaleActionComplete: (boolean) => void;
  onModalClosed: () => void;
  resalePriceFloor: number;
  collectibleResaleFeePercentage: number;
};

export const PlaceOnSaleModal = ({
  collectibleItemData,
  itemId,
  isLimited2,
  showModal,
  onPlaceOnSaleActionComplete,
  onModalClosed,
  resalePriceFloor,
  translate,
  collectibleResaleFeePercentage
}: TPlaceOnSaleModalProps & WithTranslationsProps): JSX.Element | null => {
  const [Modal, modalService] = createModal();
  let resalePrice = 0;

  const placeLimited1ItemOnSale = useCallback(
    (assetId: number, userAssetId: number, price: number) => {
      return itemDetailsLimitedInventoryService.placeLimited1ItemOnSale(
        assetId,
        userAssetId,
        price
      );
    },
    []
  );

  const placeLimited2ItemOnSale = useCallback((collectibleItem: TResellableCopy, price: number) => {
    return itemDetailsLimitedInventoryService.placeLimited2ItemOnSale(
      authenticatedUser.id,
      collectibleItem.collectibleItemId,
      collectibleItem.collectibleInstanceId,
      collectibleItem.collectibleProductId,
      true,
      price
    );
  }, []);

  const onAction = useCallback(async (id: number, itemData: TResellableCopy, listPrice: number) => {
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
      if (isLimited2 && itemData) {
        const result = await placeLimited2ItemOnSale(itemData, listPrice);
        modalService.close();
        onPlaceOnSaleActionComplete(true);
      } else {
        if (!itemData.userAssetId) {
          return;
        }
        const result = await placeLimited1ItemOnSale(id, itemData.userAssetId, listPrice);
        modalService.close();
        onPlaceOnSaleActionComplete(true);
      }
    } catch {
      onPlaceOnSaleActionComplete(false);
      modalService.close();
    }
  }, []);

  const onNeutral = () => {
    if (!collectibleItemData) {
      return;
    }
    onPlaceOnSaleActionComplete(undefined);
    modalService.close();
    onModalClosed();
  };

  const onResalePriceChange = (newPrice: number) => {
    resalePrice = newPrice;
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
        title: translate('Heading.SellItem'),
        body: (
          <PlaceOnSaleModalBody
            collectibleItemData={collectibleItemData}
            isLimited2={isLimited2}
            onResalePriceChange={onResalePriceChange}
            resalePriceFloor={resalePriceFloor}
            collectibleResaleFeePercentage={collectibleResaleFeePercentage}
          />
        ),
        neutralButtonText: translate('Action.Cancel'),
        actionButtonText: translate('Action.Sell'),
        onAction: () => {
          onAction(itemId, collectibleItemData, resalePrice).catch(() => {
            modalService.close();
            onPlaceOnSaleActionComplete(false);
          });
        },
        onNeutral,
        size: 'md'
      }}
      actionButtonShow
    />
  );
};

export default withTranslations(PlaceOnSaleModal, translationConfig);
