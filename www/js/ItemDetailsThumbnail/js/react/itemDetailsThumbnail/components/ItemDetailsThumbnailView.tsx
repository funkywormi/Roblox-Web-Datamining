import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Thumbnail2d, ThumbnailTypes, Thumbnail } from 'roblox-thumbnails';
import { Thumbnail3d, AnimatedThumbnail } from 'roblox-thumbnail-3d';
import { AxiosPromise } from 'axios';
import ItemDetailsThumbnailService, {
  TAvatarRenderAsset,
  TAvatarResult,
  TAvatarResultV2,
  TColor
} from '../services/itemDetailsThumbnailService';
import { thumbnailConstants } from '../constants/itemDetailsThumbnailConstants';

export function ItemDetailsThumbnailView({
  targetId,
  altTargetId,
  isBundle,
  isLook,
  isAnimation,
  isUserOutfit,
  mode3DEnabled,
  tryOnEnabled,
  avatar,
  avatarTryOnAssets,
  tryOnKey,
  backgroundId
}: {
  targetId: number | string;
  altTargetId: number | string;
  isBundle: boolean;
  isLook: boolean | undefined;
  isAnimation: boolean;
  isUserOutfit: boolean;
  mode3DEnabled: boolean;
  tryOnEnabled: boolean;
  avatar: TAvatarResultV2 | undefined;
  avatarTryOnAssets: Array<TAvatarRenderAsset> | undefined;
  tryOnKey: number;
  backgroundId?: number;
}): JSX.Element {
  const [thumbnail3DTryonComponent, setThumbnail3DTryonComponent] = useState<React.ReactElement>();
  const [thumbnail2DTryonComponent, setThumbnail2DTryonComponent] = useState<React.ReactElement>();

  const get3DEndpointCall = () => {
    if (isBundle && !isAnimation && isUserOutfit) {
      // This will be moved to bundle 3D thumbnail when ready
      return ItemDetailsThumbnailService.get3DOutfitThumbnail(altTargetId);
    }
    if (isBundle && !isAnimation && !isUserOutfit) {
      // This will be moved to bundle 3D thumbnail when ready
      return ItemDetailsThumbnailService.get3DAssetThumbnail(altTargetId);
    }
    if (isBundle && isAnimation) {
      return ItemDetailsThumbnailService.get3DAnimatedAssetThumbnail(altTargetId);
    }
    if (isAnimation) {
      return ItemDetailsThumbnailService.get3DAnimatedAssetThumbnail(targetId);
    }
    if (isLook) {
      return ItemDetailsThumbnailService.getBatch(targetId, 'Look');
    }
    return ItemDetailsThumbnailService.get3DAssetThumbnail(targetId);
  };

  const getThumbnailType = () => {
    if (isAnimation) {
      return 'Animation';
    }
    if (isLook) {
      return ThumbnailTypes.lookThumbnail;
    }
    return isBundle ? ThumbnailTypes.bundleThumbnail : ThumbnailTypes.assetThumbnail;
  };

  useEffect(() => {
    if (tryOnEnabled && avatarTryOnAssets !== undefined && avatar !== undefined) {
      const get3DTryonEndpointCall = () => {
        return ItemDetailsThumbnailService.postAvatarRender(
          avatarTryOnAssets,
          avatar,
          3,
          tryOnKey,
          backgroundId
        );
      };
      const get2DTryonEndpointCall = () => {
        return ItemDetailsThumbnailService.postAvatarRender2D(
          avatarTryOnAssets || [],
          avatar,
          4,
          tryOnKey,
          backgroundId
        );
      };
      setThumbnail3DTryonComponent(
        <Thumbnail3d
          key={`try-on-key-${tryOnKey}`}
          type='TryOn'
          targetId={3}
          getThumbnailJson={get3DTryonEndpointCall}
          loadingClass='thumbnail-loading thumbnail-placeholder shimmer'
        />
      );
      setThumbnail2DTryonComponent(
        <Thumbnail2d
          key={`try-on-key-${tryOnKey}`}
          type='TryOn'
          targetId={tryOnKey}
          size={thumbnailConstants.size}
          getThumbnail={get2DTryonEndpointCall}
        />
      );
    }
  }, [avatarTryOnAssets, backgroundId]);

  const get3dThumbnailComponent = () => {
    if (tryOnEnabled && thumbnail3DTryonComponent !== undefined) {
      return thumbnail3DTryonComponent;
    }

    if (isAnimation) {
      if (isBundle) {
        return (
          <AnimatedThumbnail
            targetId={altTargetId} // assetId
            containerClass=''
          />
        );
      }
      return (
        <AnimatedThumbnail
          targetId={targetId} // assetId
          containerClass=''
        />
      );
    }

    return (
      <Thumbnail3d
        type={getThumbnailType()}
        targetId={targetId}
        getThumbnailJson={get3DEndpointCall}
        loadingClass='thumbnail-loading thumbnail-placeholder shimmer'
      />
    );
  };

  const get2dThumbnailComponent = () => {
    if (tryOnEnabled && thumbnail2DTryonComponent !== undefined) {
      return thumbnail2DTryonComponent;
    }

    if (isBundle && isAnimation) {
      return (
        <Thumbnail2d
          type={ThumbnailTypes.assetThumbnail}
          targetId={altTargetId}
          size={thumbnailConstants.size}
        />
      );
    }

    if (isBundle && !isAnimation && !isUserOutfit) {
      return (
        <Thumbnail2d
          type={ThumbnailTypes.assetThumbnail}
          targetId={altTargetId}
          size={thumbnailConstants.size}
        />
      );
    }
    return (
      <Thumbnail2d type={getThumbnailType()} targetId={targetId} size={thumbnailConstants.size} />
    );
  };

  if (mode3DEnabled) {
    return get3dThumbnailComponent();
  }

  if (tryOnEnabled && thumbnail2DTryonComponent !== undefined) {
    return thumbnail2DTryonComponent;
  }
  return get2dThumbnailComponent();

  return (
    <React.Fragment>
      <div className='thumbnail-loading thumbnail-placeholder shimmer' />
    </React.Fragment>
  );
}
export default ItemDetailsThumbnailView;
