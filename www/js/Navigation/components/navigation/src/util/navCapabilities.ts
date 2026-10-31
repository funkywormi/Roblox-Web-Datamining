import type { ComponentType, ReactNode } from "react";
import type { ValueOf } from "@rbx/core-lib";
import type { AuthenticatedUser } from "@rbx/core-scripts/meta/user";
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

type NavCapabilities = {
  getNavigationHeaderBehavior: () => Promise<NavigationHeaderBehavior>;
  getVngShopSignedRedirectionUrl: () => Promise<{ vngShopRedirectUrl?: string }>;
  getUserCurrency: (userId: number) => Promise<UserCurrency>;
  getCreditBalanceForNavigation: () => Promise<CreditBalanceForNavigation>;
  getRobuxBadge: () => Promise<RobuxBadge>;
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
  getIsReactNotificationBellEnabled: () => boolean;
  getIsReactNotificationStreamEnabled: () => boolean;
  logNotificationStreamExposure: () => void;
  getNotificationUnreadCount: () => Promise<number>;
  clearNotificationUnread: () => Promise<void>;
  NotificationStreamIcon: ComponentType;
  NotificationStreamBase: ComponentType;
  NotificationStreamShell: ComponentType;
};

let capabilities: Partial<NavCapabilities> = {};

export const registerNavCapabilities = (registered: Partial<NavCapabilities>): void => {
  capabilities = { ...capabilities, ...registered };
};

export const getNavCapability = <K extends keyof NavCapabilities>(
  name: K,
): NavCapabilities[K] | undefined => capabilities[name];
