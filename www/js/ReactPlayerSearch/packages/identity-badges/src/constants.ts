/**
 * English fallback for the Roblox Plus icon a11y label. The localized copy
 * lives in Translations Hub under namespace `Feature.RobloxSubscription`, key
 * `Label.RobloxPlusSubscriber`. Surfaces resolve it via
 * `translate("Label.RobloxPlusSubscriber", undefined, PLUS_BADGE_ARIA_LABEL)`
 * and pass the result to `DisplayNameBadges` as `plusBadgeAriaLabel`. This
 * constant is the default used when no translated value is supplied.
 */
export const PLUS_BADGE_ARIA_LABEL = "Roblox Plus subscriber" as const;

/**
 * Translations Hub key (within `PLUS_BADGE_NAMESPACE`) for the Plus icon a11y
 * label. Exported so consuming surfaces reference one canonical key.
 */
export const PLUS_BADGE_ARIA_LABEL_KEY = "Label.RobloxPlusSubscriber" as const;

/**
 * Translation namespace a consuming surface must load (in its `component.json`
 * `translations` / translation config) for `PLUS_BADGE_ARIA_LABEL_KEY` to
 * resolve.
 */
export const PLUS_BADGE_NAMESPACE = "Feature.RobloxSubscription" as const;

/**
 * Field token requested in `user-profile-api/v1/user/get-profiles` to surface
 * the Plus signal. Mapped to the `isRobloxPlus` UI prop at the client
 * boundary.
 */
export const PLUS_PROFILE_FIELD = "hasRobloxSubscription" as const;
