/* eslint-disable react/jsx-no-literals */
import React from 'react';
import { TranslateFunction } from 'react-utilities';
import { TItemCardRestrictions, TItemStatus } from 'react-style-guide';
import { TAssetDetailsEntry } from '../services/itemDetailsThumbnailService';
import AnimationBundleButtons from './AnimationBundleButtons';
import ItemRestrictionRibbon from './ItemRestrictionRibbon';
import ItemStatusRibbon from './ItemStatusRibbon';
import ThumbnailButtons from './ThumbnailButtons';

export function ThumbnailUI({
  onModeButtonClick,
  onPlayButtonClick,
  onTryOnButtonClick,
  onBundleAnimationClick,
  isBundle,
  isAnimation,
  showMode3D,
  mode3DEnabled,
  modePlayEnabled,
  showTryOn,
  tryOnEnabled,
  avatarDetailsLoaded,
  itemRestrictions,
  itemStatuses,
  bundleAnimations,
  currentItem,
  translate
}: {
  onModeButtonClick: (currentlyEnabledMode: boolean) => void;
  onPlayButtonClick: (currentlyEnabledMode: boolean) => void;
  onTryOnButtonClick: (currentlyEnabledMode: boolean) => void;
  onBundleAnimationClick: (buttonPosition: number) => void;
  isBundle: boolean;
  isAnimation: boolean;
  showMode3D: boolean;
  mode3DEnabled: boolean;
  modePlayEnabled: boolean;
  showTryOn: boolean;
  tryOnEnabled: boolean;
  avatarDetailsLoaded: boolean;
  itemRestrictions: TItemCardRestrictions | undefined;
  itemStatuses: Array<TItemStatus> | undefined;
  bundleAnimations: Array<TAssetDetailsEntry> | undefined;
  currentItem: TAssetDetailsEntry | undefined;
  translate: TranslateFunction;
}): JSX.Element {
  return (
    <div className='thumbnail-ui-container'>
      <div className='top-align-container inner-thumbnail-ui-container'>
        <div className='left-align-container' />
        <div className='right-align-container'>
          {itemStatuses !== undefined && (
            <ItemStatusRibbon itemStatuses={itemStatuses} translate={translate} />
          )}
        </div>
      </div>
      <div className='bottom-align-container inner-thumbnail-ui-container'>
        <div className='left-align-container'>
          {itemRestrictions !== undefined && (
            <ItemRestrictionRibbon itemRestrictions={itemRestrictions} />
          )}
          {isBundle && isAnimation && bundleAnimations && currentItem && (
            <AnimationBundleButtons
              onBundleAnimationClick={onBundleAnimationClick}
              bundleAnimations={bundleAnimations}
              currentItem={currentItem}
            />
          )}
        </div>
        <div className='right-align-container'>
          <ThumbnailButtons
            onModeButtonClick={onModeButtonClick}
            onTryOnButtonClick={onTryOnButtonClick}
            onPlayButtonClick={onPlayButtonClick}
            showMode3D={showMode3D}
            mode3DEnabled={mode3DEnabled}
            tryOnEnabled={tryOnEnabled}
            modePlayEnabled={modePlayEnabled}
            showTryOn={showTryOn && avatarDetailsLoaded}
            isAnimation={isAnimation}
            isBundle={isBundle}
          />
        </div>
      </div>
    </div>
  );
}

export default ThumbnailUI;
