export enum AvatarItemType {
  Asset = 'Asset',
  Bundle = 'Bundle'
}

export interface Asset {
  assetId: number;
  itemType: AvatarItemType;
}
