import React from 'react';
import { Button } from 'react-style-guide';
import { getAnimationIcon } from '../utils/itemDetailsThumbnailUtils';
import { TAssetDetailsEntry } from '../services/itemDetailsThumbnailService';

export function AnimationBundleButtons({
  onBundleAnimationClick,
  bundleAnimations,
  currentItem
}: {
  onBundleAnimationClick: (buttonPosition: number) => void;
  bundleAnimations: Array<TAssetDetailsEntry>;
  currentItem: TAssetDetailsEntry;
}): JSX.Element {
  return (
    <div className='bundle-animation-btn-container'>
      <h2 className='bundle-animation-label'>{currentItem.name}</h2>
      {bundleAnimations.map((item, index) => (
        <Button
          key={item.id}
          className={`${
            item.id === currentItem.id ? 'selected' : ''
          } bundle-animation-btn thumb-interactive-btn btn-control button-placement bundle-animation-button`}
          variant={Button.variants.control}
          size={Button.sizes.small}
          width={Button.widths.default}
          onClick={() => {
            onBundleAnimationClick(index);
          }}>
          <div className={`animation-icon ${getAnimationIcon(item.assetType)}`} />
        </Button>
      ))}
    </div>
  );
}

export default AnimationBundleButtons;
