/**
 * Item-card constants, ported verbatim from
 * `@rbx/core-ui/src/components/itemCard/constants/itemCardConstants.ts`.
 *
 * `itemRestrictionIcons` values map to the sprite classes exposed by
 * `restrictionIcons.module.css` (only `limited` / `limitedUnique` / `collectible`
 * resolve to a visible glyph; the rest are intentionally disabled/empty).
 */
const itemCardConstants = {
  robloxSystemUserId: 1,
  itemRestrictionTypes: {
    thirteenPlus: "ThirteenPlus",
    limitedUnique: "LimitedUnique",
    limited: "Limited",
    rthro: "Rthro",
    dynamicHead: "Live",
    collectible: "Collectible",
  },
  itemRestrictionIcons: {
    limited: "icon-limited-label",
    limitedUnique: "icon-limited-unique-label",
    dynamicHead: "",
    collectible: "icon-limited-unique-label",
    // Disabled to preserve the feature until it is completely removed (parity with core-ui).
    thirteenPlus: "",
    thirteenPlusLimited: "",
    thirteenPlusLimitedUnique: "",
    rthroLabel: "",
    rthroLimitedLabel: "",
  },
  itemTypes: {
    bundle: "bundle",
    asset: "asset",
  },
  itemStatusTypes: {
    New: "New",
    Sale: "Sale",
    XboxExclusive: "XboxExclusive",
    AmazonExclusive: "AmazonExclusive",
    GooglePlayExclusive: "GooglePlayExclusive",
    IosExclusive: "IosExclusive",
    SaleTimer: "SaleTimer",
    IsFae: "IsFAE",
  },
  itemStatusClasses: {
    New: "status-new",
    Sale: "status-sale",
    XboxExclusive: "status-default has-text",
    AmazonExclusive: "status-default has-text",
    GooglePlayExclusive: "status-default has-text",
    IosExclusive: "status-default has-text",
  },
  // Foundation glyph names (replacing the legacy CSS-font icon spans).
  itemStatusIcons: {
    SaleTimer: "icon-regular-clock",
    IsFae: "icon-regular-lock-closed",
  },
  itemStatusLabels: {
    Sale: "Label.Sale",
    New: "Label.New",
    XboxExclusive: "Label.Xbox",
    AmazonExclusive: "Label.Amazon",
    GooglePlayExclusive: "Label.GoogleOnly",
    IosExclusive: "Label.AppleOnly",
  },
  urlConfigs: {
    assetRootUrlTemplate: "catalog",
    bundleRootUrlTemplate: "bundles",
  },
} as const;

export default itemCardConstants;
