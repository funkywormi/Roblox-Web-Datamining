export type QueryParams = {
  Keyword?: string;
  TriggeredByTopicDiscovery?: boolean;
  topics?: string;
  Category?: number;
  Subcategory?: number;
  Gears?: number;
  CreatorID?: number | 'custom';
  CreatorType?: string;
  CreatorName?: string;
  CurrencyType?: number;
  pxMin?: number | null;
  pxMax?: number | null;
  salesTypeFilter?: number;
  SortType?: number;
  SortAggregation?: number;
  IncludeNotForSale?: true;
  AssetTypeIds?: number[];
  BundleTypeIds?: number[];
  taxonomy?: string[];
  CategoryFilter?: number;
};

export type QueryParamsKey = keyof QueryParams;

// All valid QueryParamsKey values for case-insensitive comparison
const validQueryParamKeys: QueryParamsKey[] = [
  'Keyword',
  'TriggeredByTopicDiscovery',
  'topics',
  'Category',
  'Subcategory',
  'Gears',
  'CreatorID',
  'CreatorType',
  'CreatorName',
  'CurrencyType',
  'pxMin',
  'pxMax',
  'salesTypeFilter',
  'SortType',
  'SortAggregation',
  'IncludeNotForSale',
  'AssetTypeIds',
  'BundleTypeIds',
  'taxonomy',
  'CategoryFilter'
];

// Compile-time check to ensure validQueryParamKeys contains exactly the same keys as QueryParams
// This will cause a TypeScript error if the array is missing keys or has extra keys
type AllQueryParamKeys = keyof QueryParams;
type ValidateAllKeysPresent = {
  [K in AllQueryParamKeys]: K extends typeof validQueryParamKeys[number] ? true : never;
};
type ValidateNoExtraKeys = typeof validQueryParamKeys[number] extends AllQueryParamKeys
  ? true
  : never;

// These lines will cause compile errors if validQueryParamKeys doesn't match QueryParams exactly
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const validateAllKeysPresent: ValidateAllKeysPresent = {} as ValidateAllKeysPresent;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const validateNoExtraKeys: ValidateNoExtraKeys = true;

// Cache lowercase versions for better performance
const lowercaseToOriginalMap = new Map<string, QueryParamsKey>();
validQueryParamKeys.forEach(key => {
  lowercaseToOriginalMap.set(key.toLowerCase(), key);
});

export function isQueryParamKey(key: string): key is QueryParamsKey {
  return lowercaseToOriginalMap.has(key.toLowerCase());
}

export function normalizeQueryParamKey(key: string): QueryParamsKey | null {
  return lowercaseToOriginalMap.get(key.toLowerCase()) || null;
}
