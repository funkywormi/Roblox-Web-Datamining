import classNames from 'classnames';
import React, { FunctionComponent } from 'react';
import { TranslateFunction } from 'react-utilities';
import { Thumbnail2d, DefaultThumbnailSize, ThumbnailTypes } from 'roblox-thumbnails';
import { Transaction } from '../../../../ts';
import {
  CurrencyTransferDescription,
  getCurrencyTransferHeadshotTargetId
} from '../utils/currencyTransferDescription';

interface CurrencyTransferDescriptionComponentProps {
  transaction: Transaction;
  description: CurrencyTransferDescription;
  translate: TranslateFunction;
}

const CurrencyTransferDescriptionComponent: FunctionComponent<CurrencyTransferDescriptionComponentProps> = ({
  transaction,
  description,
  translate
}) => {
  const { kind, counterPartyName } = description;
  const who = counterPartyName?.trim() ?? '';

  const headshotTargetId = getCurrencyTransferHeadshotTargetId(transaction, kind);

  let displayText = '';
  if (kind === 'unableToSend') {
    if (who) {
      displayText = translate('Description.SendRefund', { user: who });
    }
  } else if (kind === 'sent') {
    if (who) {
      displayText = translate('Description.TransferSend', { user: who });
    }
  } else if (who) {
    displayText = translate('Description.RecieveTransfer', { user: who });
  }

  return (
    <div className='item-format item-sale-format'>
      {headshotTargetId !== null ? (
        <span className='item-card-image'>
          <Thumbnail2d
            key={String(headshotTargetId)}
            type={ThumbnailTypes.avatarHeadshot}
            targetId={headshotTargetId}
            size={DefaultThumbnailSize}
          />
        </span>
      ) : (
        kind === 'unableToSend' && (
          <span className='item-card-image'>
            <span
              className={classNames('thumbnail-2d-container', 'place-card-image', 'icon-logo-r')}
            />
          </span>
        )
      )}
      <div className='item-description'>{displayText}</div>
    </div>
  );
};

export default CurrencyTransferDescriptionComponent;
