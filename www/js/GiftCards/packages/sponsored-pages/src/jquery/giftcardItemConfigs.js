// ═══════════════════════════════ ITEM IDs ═══════════════════════════════════
export const ITEM_IDS = {
  // Standard CashStar Item (appears on all pages with items)
  CASHSTAR_ITEM: 139683119466435,

  // CashStar Bonus Item (appears on /giftcards page for cashstar countries)
  CASHSTAR_BONUS: 122550426347379,

  // Amazon-specific items (appear on /giftcards-retailers for select countries)
  AMAZON_ITEM_1: 124297952377057,
  AMAZON_ITEM_2: 126078884649537,
  AMAZON_ITEM_3: 111999727936653
};

// ══════════════════════ COUNTRY CONFIGURATIONS ══════════════════════════════
// Giftcards: 0 items | Retailers: 1 item
export const COUNTRIES_GIFTCARDS_NONE_RETAILERS_ONE = [
  'cy', // Cyprus
  'dk', // Denmark
  'hu', // Hungary
  'ko', // Korea
  'lv', // Latvia
  'my', // Malaysia
  'no', // Norway
  'ro', // Romania
  'se', // Sweden
  'sg', // Singapore
  'sk', // Slovakia
  'sl', // Slovenia
  'th' // Thailand
];

// Giftcards: 0 items | Retailers: 4 items
export const COUNTRIES_GIFTCARDS_NONE_RETAILERS_FOUR = [
  'us' // United States
];

// Giftcards: 2 items | Retailers: 1 item
export const COUNTRIES_GIFTCARDS_TWO_RETAILERS_ONE = [
  'at', // Austria
  'au', // Australia
  'be', // Belgium
  'br', // Brazil
  'ch', // Switzerland
  'fi', // Finland
  'gr', // Greece
  'ie', // Ireland
  'mx', // Mexico
  'nl', // Netherlands
  'nz', // New Zealand
  'pl', // Poland
  'pt', // Portugal
  'za' // South Africa
];

// Giftcards: 2 items | Retailers: 4 items
export const COUNTRIES_GIFTCARDS_TWO_RETAILERS_FOUR = [
  'ae', // United Arab Emirates
  'ca', // Canada
  'de', // Germany
  'es', // Spain
  'fr', // France
  'it', // Italy
  'jp', // Japan
  'sa', // Saudi Arabia
  'uk' // United Kingdom
];
