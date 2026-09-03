import { TTranslationNamespace } from '../services/translationService';

export type TCategoryTranslationMapping = {
  label: string;
  namespace: TTranslationNamespace;
};

export const assetTypes = {
  Plugin: 38,
  Decal: 13,
  Model: 10,
  Video: 62,
  MeshPart: 40,
  Place: 9,
  Badge: 21,
  GamePass: 34,
  Animation: 24
};
export const assetCategory = {
  Catalog: 0,
  Library: 1
};

export const categoryTranslations: Record<string, TCategoryTranslationMapping> = {
  Accessories: { label: 'LabelAccessories', namespace: 'featureCatalog' },
  All: { label: 'LabelAll', namespace: 'featureCatalog' },
  AvatarAnimations: { label: 'LabelAnimations', namespace: 'featureCatalog' },
  BackAccessories: { label: 'LabelAccessoryBack', namespace: 'featureCatalog' },
  BodyParts: { label: 'LabelBodyParts', namespace: 'featureCatalog' },
  Bundle: { label: 'Label.Bundle', namespace: 'featureCatalog' },
  Characters: { label: 'Label.Characters', namespace: 'featureCatalog' },
  ClassicPants: { label: 'Label.Clothing.ClassicPants', namespace: 'featureCatalog' },
  ClassicShirts: { label: 'Label.Clothing.ClassicShirts', namespace: 'featureCatalog' },
  ClassicTShirts: { label: 'Label.Clothing.ClassicTShirts', namespace: 'featureCatalog' },
  ClimbAnimations: { label: 'Label.ClimbAnimation', namespace: 'featureCatalog' },
  Clothing: { label: 'LabelClothing', namespace: 'featureCatalog' },
  Collectibles: { label: 'LabelCollectibles', namespace: 'featureCatalog' },
  CommunityCreations: { label: 'Label.CommunityCreations', namespace: 'featureCatalog' },
  DressSkirtAccessories: {
    label: 'Label.Clothing.DressSkirtAccessories',
    namespace: 'featureCatalog'
  },
  DynamicHeads: { label: 'Label.DynamicHead', namespace: 'featureCatalog' },
  EmoteAnimations: { label: 'Label.Emotes', namespace: 'featureCatalog' },
  FaceAccessories: { label: 'Label.Faces', namespace: 'featureCatalog' },
  Faces: { label: 'Label.Faces', namespace: 'featureCatalog' },
  FallAnimations: { label: 'Label.FallAnimation', namespace: 'featureCatalog' },
  Featured: { label: 'Label.Featured', namespace: 'featureCatalog' },
  FrontAccessories: { label: 'LabelAccessoryFront', namespace: 'featureCatalog' },
  Gear: { label: 'Label.Gear', namespace: 'featureCatalog' },
  HairAccessories: { label: 'LabelAccessoryHair', namespace: 'featureCatalog' },
  Hats: { label: 'LabelAccessoryHats', namespace: 'featureCatalog' },
  HeadAccessories: { label: 'LabelHeads', namespace: 'featureCatalog' },
  Heads: { label: 'LabelHeads', namespace: 'featureCatalog' },
  IdleAnimations: { label: 'Label.IdleAnimation', namespace: 'featureCatalog' },
  JacketAccessories: { label: 'Label.Clothing.JacketAccessories', namespace: 'featureCatalog' },
  JumpAnimations: { label: 'Label.JumpAnimation', namespace: 'featureCatalog' },
  NeckAccessories: { label: 'LabelAccessoryNeck', namespace: 'featureCatalog' },
  Packages: { label: 'LabelPackages', namespace: 'featureCatalog' },
  Pants: { label: 'LabelPants', namespace: 'featureCatalog' },
  PantsAccessories: { label: 'LabelPants', namespace: 'featureCatalog' },
  Recommended: { label: 'Label.Recommended', namespace: 'featureCatalog' },
  RunAnimations: { label: 'Label.RunAnimation', namespace: 'featureCatalog' },
  ShirtAccessories: { label: 'Label.Clothing.ShirtAccessories', namespace: 'featureCatalog' },
  Shirts: { label: 'Label.Clothing.ShirtAccessories', namespace: 'featureCatalog' },
  ShoesBundles: { label: 'Label.Clothing.ShoesBundles', namespace: 'featureCatalog' },
  ShortsAccessories: { label: 'Label.Clothing.ShortsAccessories', namespace: 'featureCatalog' },
  ShoulderAccessories: { label: 'Label.ShoulderAccessories', namespace: 'featureCatalog' },
  SweaterAccessories: { label: 'Label.Clothing.SweaterAccessories', namespace: 'featureCatalog' },
  SwimAnimations: { label: 'Label.SwimAnimation', namespace: 'featureCatalog' },
  TShirtAccessories: { label: 'Label.Clothing.TShirtAccessories', namespace: 'featureCatalog' },
  Tshirts: { label: 'Label.Clothing.TShirtAccessories', namespace: 'featureCatalog' },
  Video: { label: 'LabelVideo', namespace: 'featureCatalog' },
  WaistAccessories: { label: 'LabelAccessoryWaist', namespace: 'featureCatalog' },
  WalkAnimations: { label: 'Label.WalkAnimation', namespace: 'featureCatalog' }
};

export const bundleSlotTranslations: Record<number, string> = {
  1: 'Label.FullBody',
  2: 'LabelAnimations',
  3: 'Label.Clothing.ShoesBundles',
  4: 'Label.Head'
};
export const groupBundleSlotTranslations: Record<number, string> = {
  1: '',
  2: '',
  3: 'Label.Clothing',
  4: 'Label.Body'
};

export const subcategoryTranslations: Record<string, TCategoryTranslationMapping> = {};
