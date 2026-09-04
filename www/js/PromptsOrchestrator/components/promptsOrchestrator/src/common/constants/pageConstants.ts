export const AppPage = {
  Communities: "Communities",
  Home: "Home",
  ProfilePlatform: "ProfilePlatform",
} as const;

export type AppPage = (typeof AppPage)[keyof typeof AppPage];

/**
 * When something is added to the overlay, it is not guaranteed to have
 * an AppPage. This stands in for that scenario
 */
export const OVERLAY_PAGE = "overlay" as const;

export type AppPageOrOverlay = AppPage | typeof OVERLAY_PAGE;
