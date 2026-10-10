import { ValueOf } from "@rbx/core-types";
import { callBehaviour } from "@rbx/core-scripts/guac";
import * as http from "@rbx/core-scripts/http";
import {
  getLogoutUrl,
  getUnreadPrivateMessagesCountUrl,
  getUserCurrencyUrl,
  getTradeStatusCountUrl,
  getFriendsRequestCountUrl,
  getCreditBalanceForNavigationUrl,
  getSignedVngShopUrl,
  getRobuxBadgeUrl,
} from "../constants/urlConstants";
import layoutConstants from "../constants/layoutConstants";
import { withApiMetrics } from "../topNav/observability";

export const getUnreadPrivateMessagesCount = () => {
  const urlConfig = { url: getUnreadPrivateMessagesCountUrl(), withCredentials: true };
  return http.get<{ count: number }>(urlConfig);
};

export const getUserCurrency = (userId: number) => {
  const urlConfig = { url: getUserCurrencyUrl(userId), withCredentials: true };
  return withApiMetrics("UserCurrency", () => http.get<{ robux: number }>(urlConfig));
};

export const getGuacBehavior = () => {
  return withApiMetrics("HeaderGuac", () =>
    callBehaviour<{ shouldShowVng: boolean; notificationsCanAccessStream: boolean }>(
      "navigation-header-ui",
    ),
  );
};

export const getTradeStatusCount = () => {
  const urlConfig = { url: getTradeStatusCountUrl(), withCredentials: true };
  return http.get<{ count: number }>(urlConfig);
};

export const getFriendsRequestCount = () => {
  const urlConfig = { url: getFriendsRequestCountUrl(), withCredentials: true };
  return http.get<{ count: number }>(urlConfig);
};

export const logout = () => {
  const urlConfig = { url: getLogoutUrl(), withCredentials: true };
  return withApiMetrics("Logout", () => http.post(urlConfig));
};

export const getCreditBalanceForNavigation = () => {
  const urlConfig = { url: getCreditBalanceForNavigationUrl(), withCredentials: true };
  return withApiMetrics("CreditBalance", () =>
    http.get<{
      creditDisplayConfig: ValueOf<typeof layoutConstants.creditDisplayConfigVariants> | null;
      creditBalance: number | null;
      currencyCode: string | null;
    }>(urlConfig),
  );
};

export const getVngShopSignedRedirectionUrl = () => {
  const urlConfig = { url: getSignedVngShopUrl(), withCredentials: true };
  return withApiMetrics("VngShopUrl", () => http.get<{ vngShopRedirectUrl?: string }>(urlConfig));
};

export const getRobuxBadge = () => {
  const urlConfig = { url: getRobuxBadgeUrl(), withCredentials: true };
  return withApiMetrics("RobuxBadge", () =>
    http.get<{
      is_virtual_item_available: boolean;
      active_virtual_item_start_time_seconds_utc: number;
    }>(urlConfig),
  );
};
