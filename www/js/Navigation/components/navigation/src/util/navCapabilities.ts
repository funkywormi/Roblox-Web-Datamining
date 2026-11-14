import { createContext, useContext, type ComponentType, type ReactNode } from "react";
import { window as browserWindow } from "@rbx/core-lib/browser";
import type { ValueOf } from "@rbx/core-lib";
import type { AuthenticatedUser } from "@rbx/core-scripts/meta/user";
import type { SendUserPurchaseFlowEventParams } from "@rbx/payments/payments-flow-analytics";
import type layoutConstants from "../constants/layoutConstants";
import type { TIntAuthComplianceResponse } from "../services/complianceService";
import type { Variant } from "../leftNav/observability";
import type {
  TAvatarAutocompleteSuggestion,
  TGamesAutocompleteSuggestion,
} from "../services/searchTypes";

export type NavigationHeaderBehavior = {
  shouldShowVng: boolean;
  notificationsCanAccessStream: boolean;
};

export type UserCurrency = { robux: number };

export type CreditBalanceForNavigation = {
  creditDisplayConfig: ValueOf<typeof layoutConstants.creditDisplayConfigVariants> | null;
  creditBalance: number | null;
  currencyCode: string | null;
};

export type RobuxBadge = {
  is_virtual_item_available: boolean;
  active_virtual_item_start_time_seconds_utc: number;
};

export type PlusNavEntries = {
  isPlusSubscriber: boolean;
  topEntries: ReactNode;
  upsellEntry: ReactNode;
};

export type NavCapabilities = {
  getNavigationHeaderBehavior: () => Promise<NavigationHeaderBehavior>;
  getVngShopSignedRedirectionUrl: () => Promise<{ vngShopRedirectUrl?: string }>;
  getUserCurrency: (userId: number) => Promise<UserCurrency>;
  getCreditBalanceForNavigation: () => Promise<CreditBalanceForNavigation>;
  getRobuxBadge: () => Promise<RobuxBadge>;
  sendUserPurchaseFlowEvent: (params: SendUserPurchaseFlowEventParams) => void;
  toNavHref: (url: string) => string;
  isTopNavDownloadEnabled: () => Promise<boolean>;
  getIntAuthCompliancePolicy: () => Promise<TIntAuthComplianceResponse>;
  useIsAccountSwitcherAvailableForBrowser: () => [boolean, boolean];
  getStoredAccountSwitcherBlob: () => string;
  syncAccountSwitcherBlobIfNeeded: () => Promise<void>;
  openAccountSwitcher: () => void;
  logoutUser: () => Promise<void>;
  saveGameIntentFromCurrentUrl: () => void;
  getFriendRequestCount: () => Promise<number>;
  getMessageUnreadCount: () => Promise<number>;
  getTradeInboundCount: () => Promise<number>;
  subscribeRealTime: (event: string, callback: () => Promise<void>) => () => void;
  useLiveUserNameForDisplay: (user: AuthenticatedUser) => string;
  useHasVerifiedBadge: (user: AuthenticatedUser) => boolean;
  useStreamedValue: <T>(promise: Promise<T>) => T;
  AvatarHeadshot: ComponentType<{ userId: number; altName?: string; containerClass?: string }>;
  useIsPlusBadgeEnabled: () => boolean;
  UncheckedBadge: ComponentType;
  shouldShowUncheckedBadge: () => boolean;
  useCommunitiesEntrypointTelemetry: () => { onExpose: () => void; onClick: () => void };
  usePlusNavEntries: (currentPath: string) => PlusNavEntries;
  logLeftNavExposure: () => Promise<void>;
  logTopNavDownloadExposure: () => Promise<void>;
  trackOpenToVisible: (variant: Variant) => void;
  getGamesAutocompleteSuggestions: (search: string) => Promise<TGamesAutocompleteSuggestion>;
  getAvatarAutocompleteSuggestions: (
    search: string,
    languageCode: string,
    limit: number,
    previousQuery: string,
    useFallback: boolean,
  ) => Promise<TAvatarAutocompleteSuggestion>;
  isSearchRequestCancelled: (error: unknown) => boolean;
  searchLanding: {
    mount: () => void;
    show: (sessionInfo: string) => void;
    updateSessionInfo: (sessionInfo: string) => void;
  };
  getInternalPageName: () => string | undefined;
  getLocale: () => string;
  GameIconThumbnail: ComponentType<{ universeId: number; onLoad: () => void }>;
  isTopSearchResultsEnabled: () => boolean;
  logTopSearchResultsExposureOnce: () => void;
  getNotificationUnreadCount: () => Promise<number>;
  clearNotificationUnread: () => Promise<void>;
  NotificationStreamShell: ComponentType;
};

let capabilities: Partial<NavCapabilities> = {};

// The module registry is shared by every request on the server, so it only fills in the browser.
export const registerNavCapabilities = (registered: Partial<NavCapabilities>): void => {
  if (browserWindow == null) {
    return;
  }
  capabilities = { ...capabilities, ...registered };
};

/** For handlers and effects, which only run in the browser. Render code uses useNavCapability. */
export const getNavCapability = <K extends keyof NavCapabilities>(
  name: K,
): NavCapabilities[K] | undefined => capabilities[name];

export const NavCapabilitiesContext = createContext<Partial<NavCapabilities> | null>(null);

export const useNavCapability = <K extends keyof NavCapabilities>(
  name: K,
): NavCapabilities[K] | undefined => (useContext(NavCapabilitiesContext) ?? capabilities)[name];
