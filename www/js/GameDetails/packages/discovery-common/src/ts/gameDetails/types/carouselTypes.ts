// Asset definitions are at https://github.rbx.com/Roblox/web-platform/blob/master/Assemblies/Platform/Assets/Roblox.Platform.Assets/Enums/AssetType.cs
export enum TAssetTypeId {
  Image = 1,
  YouTubeVideo = 33,
  GamePreviewVideo = 86,
  Unknown = 0,
}

export enum TAssetType {
  Image = "Image",
  YouTubeVideo = "YouTubeVideo",
  Place = "Place",
  GamePreviewVideo = "GamePreviewVideo",
  // TODO: old, migrated code
  // eslint-disable-next-line @typescript-eslint/no-mixed-enums
  Unknown = 0,
}

export type TGetUniverseAssetIdsResponse =
  | {
      assetTypeId?: TAssetTypeId.Image;
      assetType: TAssetType.Image;
      imageId: number;
      approved: boolean;
      altText: string;
    }
  | {
      assetTypeId?: TAssetTypeId.YouTubeVideo;
      assetType: TAssetType.YouTubeVideo;
      videoHash: string;
      videoTitle: string;
      approved: boolean;
    }
  | {
      assetTypeId?: TAssetTypeId.GamePreviewVideo;
      assetType: TAssetType.GamePreviewVideo;
      videoId: number;
      imageId: number;
      approved: boolean;
    };

type TBaseCarouselItem = {
  id: string;
  type: TAssetType;
};

export type TCarouselAssetItem = TBaseCarouselItem & {
  type: TAssetType.Image | TAssetType.Place | TAssetType.Unknown;
  assetId: number;
  altText?: string;
};

export type TCarouselYouTubeVideoItem = TBaseCarouselItem & {
  type: TAssetType.YouTubeVideo;
  videoHash: string;
};

export type TCarouselGamePreviewVideoItem = TBaseCarouselItem & {
  type: TAssetType.GamePreviewVideo;
  videoId: number;
  imageId: number;
};

export type TCarouselItem =
  | TCarouselAssetItem
  | TCarouselYouTubeVideoItem
  | TCarouselGamePreviewVideoItem;
