import React, { useCallback } from 'react';
import { ItemCard } from 'react-style-guide';
import SponsoredCatalogItemsService from '../services/SponsoredCatalogItemsService';

export type TSponsoredCatalogItemCardProps = {
  id: number;
  name: string;
  type: string;
  creatorName: string;
  creatorType: string;
  creatorTargetId: number;
  price: number | undefined;
  lowestPrice: number | undefined;
  priceStatus: string | undefined;
  premiumPricing: number | undefined;
  unitsAvailableForConsumption: number | undefined;
  itemStatus: Array<string> | undefined;
  itemRestrictions: Array<string> | undefined;
  thumbnail2d: React.ReactElement;
  encryptedAdTrackingData: string;
  placementLocation: string;
};

export function SponsoredCatalogItemCard({
  id,
  name,
  type,
  creatorName,
  creatorType,
  creatorTargetId,
  price,
  lowestPrice,
  priceStatus,
  premiumPricing,
  unitsAvailableForConsumption,
  itemStatus,
  itemRestrictions,
  thumbnail2d,
  encryptedAdTrackingData,
  placementLocation
}: TSponsoredCatalogItemCardProps): JSX.Element {
  const recordClick = useCallback(async () => {
    return SponsoredCatalogItemsService.recordClick(encryptedAdTrackingData, placementLocation);
  }, [encryptedAdTrackingData, placementLocation]);

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div className='sponsored-item-card' onClick={recordClick} onKeyDown={recordClick}>
      <ItemCard
        id={id}
        name={name}
        type={type}
        creatorName={creatorName}
        creatorType={creatorType}
        creatorTargetId={creatorTargetId}
        price={price}
        lowestPrice={lowestPrice}
        priceStatus={priceStatus}
        premiumPricing={premiumPricing}
        unitsAvailableForConsumption={unitsAvailableForConsumption}
        itemStatus={itemStatus}
        itemRestrictions={itemRestrictions}
        thumbnail2d={thumbnail2d}
      />
    </div>
  );
}
export default SponsoredCatalogItemCard;
