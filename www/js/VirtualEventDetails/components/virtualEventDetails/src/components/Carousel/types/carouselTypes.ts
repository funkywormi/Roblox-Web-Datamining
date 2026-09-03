export enum TAssetTypeId {
  Image = 1,
  YouTubeVideo = 33,
  Unknown = 0,
}

export enum TAssetType {
  Image = "Image",
  YouTubeVideo = "YouTubeVideo",
  Place = "Place",
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
    };

export type TCarouselAssetItem = {
  type: TAssetType.Image | TAssetType.Place | TAssetType.Unknown;
  assetId: number;
  altText?: string;
};

export type TCarouselVideoItem = {
  type: TAssetType.YouTubeVideo;
  videoHash: string;
};

export type TCarouselItem = TCarouselAssetItem | TCarouselVideoItem;
