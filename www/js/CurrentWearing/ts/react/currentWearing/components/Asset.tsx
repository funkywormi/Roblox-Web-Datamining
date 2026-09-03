import React from 'react';
import { Link } from 'react-style-guide';
import { Thumbnail2d, ThumbnailTypes } from 'roblox-thumbnails';
import { AssetDetail } from '../services/currentWearingService';
import currentWearingContants from '../constants/currentWearingContants';

export type AssetProps = {
  asset: AssetDetail;
};
const Asset = ({ asset }: AssetProps): JSX.Element => {
  const isLimited = asset.itemRestrictions?.includes(
    currentWearingContants.restrictionType.limited
  );
  const isLimitedUnique = asset.itemRestrictions?.includes(
    currentWearingContants.restrictionType.limitedUnique
  );
  const isLimited2 = asset.itemRestrictions?.includes(
    currentWearingContants.restrictionType.collectible
  );
  let restrictionIcon;
  if (isLimitedUnique) {
    restrictionIcon = <span className='icon-label icon-limited-unique-label' />;
  } else if (isLimited) {
    restrictionIcon = <span className='icon-label icon-limited-label' />;
  } else if (isLimited2) {
    restrictionIcon = <span className='icon-label icon-limited-unique-label' />;
  }
  return (
    <li className='accoutrement-item'>
      <Link url={`/catalog/${asset.id}`}>
        <Thumbnail2d
          targetId={asset.id}
          type={ThumbnailTypes.assetThumbnail}
          imgClassName='accoutrment-image'
          altName={asset.name}
        />
        <div className='asset-restriction-icon'>{restrictionIcon}</div>
      </Link>
    </li>
  );
};

export default Asset;
