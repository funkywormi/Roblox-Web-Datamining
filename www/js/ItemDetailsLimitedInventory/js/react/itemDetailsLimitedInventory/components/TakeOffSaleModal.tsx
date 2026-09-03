/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useEffect, useCallback } from 'react';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { createModal } from 'react-style-guide';
import { authenticatedUser } from 'header-scripts';
import translationConfig from '../translation.config';
import { TResellableCopy } from '../containers/ItemDetailsLimitedInventoryContainer';
import { itemDetailsLimitedInventoryService } from '../services/itemDetailsLimitedInventoryService';

type TTakeOffSaleModalProps = {
  collectibleItemData: TResellableCopy | undefined;
  itemId: number;
  isLimited2: boolean;
  showModal: boolean;
  onTakeOffSaleActionComplete: (boolean) => void;
  onModalClosed: () => void;
};

export const TakeOffSaleModal = ({
  collectibleItemData,
  itemId,
  isLimited2,
  showModal,
  onTakeOffSaleActionComplete,
  onModalClosed,
  translate
}: TTakeOffSaleModalProps & WithTranslationsProps): JSX.Element | null => {
  const [Modal, modalService] = createModal();
  const placeLimited1ItemOffSale = useCallback((assetId: number, userAssetId: number) => {
    return itemDetailsLimitedInventoryService.placeLimited1ItemOnSale(
      assetId,
      userAssetId,
      undefined
    );
  }, []);
  const placeLimited2ItemOffSale = useCallback((collectibleItem: TResellableCopy) => {
    return itemDetailsLimitedInventoryService.placeLimited2ItemOnSale(
      authenticatedUser.id,
      collectibleItem.collectibleItemId,
      collectibleItem.collectibleInstanceId,
      collectibleItem.collectibleProductId,
      false,
      undefined
    );
  }, []);

  const onAction = useCallback(async (id: number, itemData: TResellableCopy) => {
    if (!itemData) {
      modalService.close();
      onTakeOffSaleActionComplete(false);
      return;
    }
    try {
      if (isLimited2 && itemData) {
        const result = await placeLimited2ItemOffSale(itemData);
        modalService.close();
        onTakeOffSaleActionComplete(true);
      } else {
        if (!itemData.userAssetId) {
          return;
        }
        const result = await placeLimited1ItemOffSale(id, itemData.userAssetId);
        modalService.close();
        onTakeOffSaleActionComplete(true);
      }
    } catch {
      modalService.close();
      onTakeOffSaleActionComplete(false);
    }
  }, []);

  const onNeutral = () => {
    if (!collectibleItemData) {
      return;
    }
    onTakeOffSaleActionComplete(undefined);
    modalService.close();
    onModalClosed();
  };

  useEffect(() => {
    if (collectibleItemData && showModal) {
      modalService.open();
    } else {
      modalService.close();
    }
  }, [collectibleItemData, modalService, showModal]);

  const body = <div className='modal-body'>{translate('Label.TakeOffSaleConfirmation')}</div>;
  if (!collectibleItemData) {
    return <div />;
  }
  return (
    <Modal
      {...{
        title: translate('Heading.TakeOffSale'),
        body,
        neutralButtonText: translate('Action.Cancel'),
        actionButtonText: translate('Heading.TakeOffSale'),
        onAction: () => {
          onAction(itemId, collectibleItemData).catch(() => {
            modalService.close();
            onTakeOffSaleActionComplete(false);
          });
        },
        onNeutral
      }}
      actionButtonShow
    />
  );
};

export default withTranslations(TakeOffSaleModal, translationConfig);
