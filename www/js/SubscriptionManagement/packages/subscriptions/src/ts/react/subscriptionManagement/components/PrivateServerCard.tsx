import React from 'react';
import { Thumbnail2d, ThumbnailTypes } from 'roblox-thumbnails';
import { useTranslation } from 'react-utilities';
import CycleEndDate from './CycleEndDate';
import '../../../../css/subscriptionManagement/subscriptionCard.scss';
import { MyPrivateServerType } from '../../../core/types/privateServerTypes';
import PriceDisplayInRobux from './PriceDisplayInRobux';

type PrivateServerCardProps = {
  privateServer: MyPrivateServerType;
  isPriceLoading?: boolean;
  onClick?: () => void;
};

const PrivateServerCard: React.FC<PrivateServerCardProps> = ({
  privateServer,
  isPriceLoading = false,
  onClick
}) => {
  const { translate } = useTranslation();
  const expiryDate = new Date(privateServer.expirationDate);
  // CycleEndDate component assumes it's not renewing if the renewaldate is 0
  const renewalDate = privateServer.willRenew ? expiryDate : new Date(0);

  const displayName = translate('Label.PrivateServer', { privateServerName: privateServer.name });

  const renderIcon = () => {
    return (
      <Thumbnail2d
        targetId={privateServer.universeId}
        type={ThumbnailTypes.gameIcon}
        imgClassName='subcard-icon'
        containerClass='thumbnail-card-container'
        altName={privateServer.name}
      />
    );
  };

  return (
    <button className='subcard-container' onClick={onClick} type='button'>
      <div className='subcard-icon-container'>{renderIcon()}</div>
      <div className='subcard-info'>
        <div className='subcard-info-primary'>
          <span className='subscription-name font-body'>{displayName}</span>
          <span className='subscription-provider text-description'>
            {privateServer.universeName}
          </span>
        </div>
        <div className='subcard-info-secondary'>
          <PriceDisplayInRobux
            priceInRobux={privateServer.priceInRobux}
            totalDiscountAmountInRobux={privateServer.totalDiscountAmountInRobux}
            isLoading={isPriceLoading}
          />
          <CycleEndDate expiration={expiryDate} renewal={renewalDate} />
        </div>
      </div>
      <div className='warning-icon' />
      <span className='icon-right more-details' />
    </button>
  );
};

export default PrivateServerCard;
