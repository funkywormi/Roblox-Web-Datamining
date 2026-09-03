import { AxiosPromise, AxiosResponse, httpService } from 'core-utilities';
import { Thumbnail } from 'roblox-thumbnails';
import { AvatarAccoutrementService, AccoutrementAsset } from 'Roblox';
import urlConfigs from '../constants/urlConfigs';
import { thumbnailConstants } from '../constants/itemDetailsThumbnailConstants';

export type TTryOnAsset = {
  id: number;
  assetType: number;
  meta?: {};
};

export type TAvatarResult = {
  scales: {
    height: number;
    width: number;
    head: number;
    depth: number;
    proportion: number;
    bodyType: number;
  };
  playerAvatarType: string;
  bodyColors: {
    headColorId: number;
    torsoColorId: number;
    rightArmColorId: number;
    leftArmColorId: number;
    rightLegColorId: number;
    leftLegColorId: number;
  };
  assets: Array<AccoutrementAsset>;
};

export type TScales = {
  height: number;
  width: number;
  head: number;
  depth: number;
  proportion: number;
  bodyType: number;
};
export type TColors = {
  headColor3: string;
  torsoColor3: string;
  rightArmColor3: string;
  leftArmColor3: string;
  rightLegColor3: string;
  leftLegColor3: string;
};
export type TAvatarResultV2 = {
  scales: TScales;
  playerAvatarType: string;
  bodyColor3s: TColors;
  assets: Array<AccoutrementAsset>;
};

export type TAvatarRules = {
  bodyColorsPalette: Array<TColor>;
};
export type TColor = {
  brickColorId: number;
  hexColor: string;
};
export type TAvatarRenderAsset = {
  id: number;
  meta: TMeta;
};
export type TMeta = {
  order: number;
  version: number;
};
export type TBackgroundRequestModel = {
  id: number;
};
export type TAssetDetailsResult = {
  data: Array<TAssetDetailsEntry>;
};

export type TAssetDetailsEntry = {
  id: number;
  name: string;
  itemRestrictions: Array<string>;
  itemType: string;
  itemStatus: Array<string>;
  assetType: number;
};

export type TBundleDetailsResult = {
  data: Array<TBundleDetailsEntry>;
};

export type TBundleDetailsEntry = {
  bundleType: string;
  itemRestrictions: Array<string>;
  items: Array<TBundleItem>;
};

export type TBundleItem = {
  id: number;
  type: string;
};

export type T3DAssetThumbnailResult = {
  data: T3DAssetThumbnailEntry;
};

export type T3DAssetThumbnailEntry = {
  targetId: number;
  status: string;
  imageUrl: string;
};

export const ItemDetailsThumbnailService = {
  getAvatar(): AxiosPromise<TAvatarResultV2> {
    return httpService.get(urlConfigs.getAvatar);
  },
  getAvatarRules(): AxiosPromise<TAvatarRules> {
    return httpService.get(urlConfigs.avatarRules);
  },
  getColorHex(colorId: number, bodyColors: Array<TColor>): string {
    let hexColor = thumbnailConstants.defaultBodyColor;
    bodyColors.forEach((color: TColor) => {
      if (color.brickColorId === colorId) {
        hexColor = color.hexColor;
      }
    });
    return hexColor;
  },
  postAvatarRender(
    assets: Array<TAvatarRenderAsset>,
    avatarData: TAvatarResultV2,
    renderType: number,
    thumbnailId: number,
    backgroundId?: number
  ): AxiosPromise<unknown> {
    const requestBody: {
      thumbnailConfig: { thumbnailId: number; thumbnailType: string; size: string };
      avatarDefinition: {
        assets: Array<TAvatarRenderAsset>;
        bodyColors: {
          headColor: string;
          leftArmColor: string;
          leftLegColor: string;
          rightArmColor: string;
          rightLegColor: string;
          torsoColor: string;
        };
        scales: TScales;
        playerAvatarType: { playerAvatarType: string };
        backgroundRequestModel?: TBackgroundRequestModel;
      };
    } = {
      thumbnailConfig: {
        thumbnailId,
        thumbnailType: `${renderType}d`,
        size: thumbnailConstants.size
      },
      avatarDefinition: {
        assets,
        bodyColors: {
          headColor: avatarData.bodyColor3s.headColor3,
          leftArmColor: avatarData.bodyColor3s.leftArmColor3,
          leftLegColor: avatarData.bodyColor3s.leftLegColor3,
          rightArmColor: avatarData.bodyColor3s.rightArmColor3,
          rightLegColor: avatarData.bodyColor3s.rightLegColor3,
          torsoColor: avatarData.bodyColor3s.torsoColor3
        },
        scales: avatarData.scales,
        playerAvatarType: {
          playerAvatarType: avatarData.playerAvatarType
        }
      }
    };
    if (backgroundId !== undefined) {
      requestBody.avatarDefinition.backgroundRequestModel = { id: backgroundId };
    }
    return httpService.post(urlConfigs.avatarRender, requestBody);
  },
  // This should be changed in the future, but the custom thumbnail endpoint UI wants <Thumbnail> for 2d and <unknown> for 3d
  postAvatarRender2D(
    assets: Array<TAvatarRenderAsset>,
    avatarData: TAvatarResultV2,
    renderType: number,
    thumbnailId: number,
    backgroundId?: number
  ): AxiosPromise<Thumbnail> {
    const requestBody: {
      thumbnailConfig: { thumbnailId: number; thumbnailType: string; size: string };
      avatarDefinition: {
        assets: Array<TAvatarRenderAsset>;
        bodyColors: {
          headColor: string;
          leftArmColor: string;
          leftLegColor: string;
          rightArmColor: string;
          rightLegColor: string;
          torsoColor: string;
        };
        scales: TScales;
        playerAvatarType: { playerAvatarType: string };
        backgroundRequestModel?: TBackgroundRequestModel;
      };
    } = {
      thumbnailConfig: {
        thumbnailId,
        thumbnailType: renderType === 4 ? '2dWebp' : `${renderType}d`,
        size: thumbnailConstants.size
      },
      avatarDefinition: {
        assets,
        bodyColors: {
          headColor: avatarData.bodyColor3s.headColor3,
          leftArmColor: avatarData.bodyColor3s.leftArmColor3,
          leftLegColor: avatarData.bodyColor3s.leftLegColor3,
          rightArmColor: avatarData.bodyColor3s.rightArmColor3,
          rightLegColor: avatarData.bodyColor3s.rightLegColor3,
          torsoColor: avatarData.bodyColor3s.torsoColor3
        },
        scales: avatarData.scales,
        playerAvatarType: {
          playerAvatarType: avatarData.playerAvatarType
        }
      }
    };
    if (backgroundId !== undefined) {
      requestBody.avatarDefinition.backgroundRequestModel = { id: backgroundId };
    }
    return httpService.post(urlConfigs.avatarRender, requestBody);
  },
  convertAssetToAvatarRenderAsset(asset: AccoutrementAsset): TAvatarRenderAsset {
    let meta = {} as TMeta;
    if (AvatarAccoutrementService.isLayeredClothing(asset.assetType.id)) {
      meta = {
        ...asset.meta,
        order:
          asset.meta !== undefined && asset.meta.order !== undefined
            ? asset.meta.order
            : AvatarAccoutrementService.getLayeredClothingAssetOrder(asset.assetType.id),
        version: 1
      } as TMeta;
      return {
        id: asset.id,
        meta: asset.meta ?? meta
      } as TAvatarRenderAsset;
    }
    return {
      id: asset.id,
      meta: asset.meta
    } as TAvatarRenderAsset;
  },
  postAssetDetails(targetId: number): AxiosPromise<TAssetDetailsResult> {
    const requestBody = {
      items: [
        {
          itemType: 'Asset',
          id: targetId
        }
      ]
    };
    return httpService.post(urlConfigs.assetItemDetails, requestBody);
  },
  postAssetDetailsArray(targetIds: Array<number>): AxiosPromise<TAssetDetailsResult> {
    const items = new Array<unknown>();
    targetIds.map(item =>
      items.push({
        itemType: 'Asset',
        id: item
      })
    );
    const requestBody = {
      items
    };
    return httpService.post(urlConfigs.assetItemDetails, requestBody);
  },
  convertAssetDetailsToAsset(assetDetail: TTryOnAsset): AccoutrementAsset {
    return {
      id: assetDetail.id,
      assetType: AvatarAccoutrementService.getAssetTypeById(assetDetail.assetType),
      meta: assetDetail.meta !== undefined ? assetDetail.meta : undefined
    } as AccoutrementAsset;
  },
  getBundleDetails(targetId: number): AxiosPromise<Array<TBundleDetailsEntry>> {
    const requestBody = {
      bundleIds: [targetId]
    };
    return httpService.get(urlConfigs.bundleItemDetails, requestBody);
  },
  get3DAssetThumbnail(targetId: number | string): AxiosPromise<unknown> {
    const requestBody = {
      assetId: targetId
    };
    return httpService.get(urlConfigs.asset3DThumbnail, requestBody);
  },
  get2DAssetThumbnail(targetId: number | string): AxiosPromise<Thumbnail> {
    const requestBody = {
      assetIds: [targetId],
      size: thumbnailConstants.size,
      format: thumbnailConstants.format
    };
    return httpService.get(urlConfigs.asset2DThumbnail, requestBody);
  },
  get3DAnimatedAssetThumbnail(targetId: number | string): AxiosPromise<unknown> {
    const requestBody = {
      assetId: targetId
    };

    return httpService.get(urlConfigs.animation3DThumbnail, requestBody);
  },
  get3DOutfitThumbnail(targetId: number | string): AxiosPromise<unknown> {
    const requestBody = {
      outfitId: targetId
    };

    return httpService.get(urlConfigs.outfits3DThumbnail, requestBody);
  },
  get2DBundleThumbnail(targetId: number | string): AxiosPromise<Thumbnail> {
    const requestBody = {
      bundleIds: [targetId],
      size: thumbnailConstants.size,
      format: thumbnailConstants.format,
      isCircular: false
    };
    return httpService.get(urlConfigs.asset2DThumbnail, requestBody);
  },
  getBatch(targetId: number | string, type: string): AxiosPromise<unknown> {
    const requestBody = [
      {
        targetId,
        type,
        size: '420x420',
        format: 'obj'
      }
    ];

    return httpService.post(urlConfigs.batchThumbnail, requestBody).then(response => {
      const modifiedResponse = { ...response };
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
      const [firstElement] = (response.data as any)?.data || [];
      modifiedResponse.data = firstElement;
      return modifiedResponse;
    });
  }
};

export default ItemDetailsThumbnailService;
