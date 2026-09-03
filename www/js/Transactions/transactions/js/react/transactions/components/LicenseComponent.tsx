import React, { FunctionComponent } from 'react';
import { TranslateFunction } from 'react-utilities';
import { Thumbnail2d, DefaultThumbnailSize, ThumbnailTypes } from 'roblox-thumbnails';
import { useLicenseData } from '../hooks/useLicenseData';

interface LicenseComponentProps {
  agreementId?: string;
  translate: TranslateFunction;
}

const LicenseComponent: FunctionComponent<LicenseComponentProps> = ({ agreementId, translate }) => {
  const { licenseData, isLoading, isError } = useLicenseData(agreementId);

  if (isLoading) {
    return <div>{translate('Label.Loading')}</div>;
  }

  if (isError || !licenseData) {
    return <div>{translate('Message.UnknownError')}</div>;
  }

  return (
    <div className='item-format'>
      <Thumbnail2d
        containerClass='license-card-image'
        type={ThumbnailTypes.assetThumbnail}
        targetId={licenseData.ipListingThumbnailAssetId}
        size={DefaultThumbnailSize}
      />
      <div className='item-description'>
        <div className='text-overflow'>{licenseData.licenseName}</div>
        <div className='item-card-label text-overflow'>{licenseData.ipFamilyName}</div>
      </div>
    </div>
  );
};

export default LicenseComponent;
