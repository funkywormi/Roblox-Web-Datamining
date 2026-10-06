import { getRealtimeConfigVersion, getRealtimeGlobals } from "./realtimeConfig";

export type RealtimeSettings = {
  notificationsUrl: string;
  maxConnectionTimeInMs: number;
  isEventPublishingEnabled: boolean | undefined;
  isDisconnectOnSlowConnectionDisabled: boolean | undefined;
  userId: number;
  isSignalRClientTransportRestrictionEnabled: boolean | undefined;
  isLocalStorageEnabled: boolean | undefined;
  isRealtimeWebAnalyticsEnabled: boolean | undefined;
  isRealtimeWebAnalyticsConnectionEventsEnabled: boolean | undefined;
  isRealtimeDurableReplayEnabled: boolean | undefined;
  isRealtimeTailLossPollingEnabled: boolean | undefined;
  realtimeTailLossPollingBaseIntervalMs: number;
  realtimeTailLossPollingMaxIntervalMs: number;
  realtimeTailLossPollingBackoffMultiplier: number;
  isRealtimeTailLossGapDetectionEnabled: boolean | undefined;
  realtimeTailLossPollingRetryMaxAttempts: number;
  realtimeMessageDedupeLruCacheSize: number;
};

// String() keeps parseInt's coercion for non-string globals.
const toInt = (value: unknown) => parseInt(String(value), 10);

let settings: RealtimeSettings | null = null;
let settingsConfigVersion = -1;
const getSettings = () => {
  if (settings === null || settingsConfigVersion !== getRealtimeConfigVersion()) {
    settingsConfigVersion = getRealtimeConfigVersion();
    // Every field is assigned below.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    settings = {} as RealtimeSettings;
    const { RealTimeSettings, CurrentUser } = getRealtimeGlobals();
    if (RealTimeSettings) {
      settings.notificationsUrl = RealTimeSettings.NotificationsEndpoint;
      settings.maxConnectionTimeInMs = toInt(RealTimeSettings.MaxConnectionTime); // six hours
      settings.isEventPublishingEnabled = RealTimeSettings.IsEventPublishingEnabled;
      settings.isDisconnectOnSlowConnectionDisabled =
        RealTimeSettings.IsDisconnectOnSlowConnectionDisabled;
      settings.userId = CurrentUser ? toInt(CurrentUser.userId) : -1;
      settings.isSignalRClientTransportRestrictionEnabled =
        RealTimeSettings.IsSignalRClientTransportRestrictionEnabled;
      settings.isLocalStorageEnabled = RealTimeSettings.IsLocalStorageInRealTimeEnabled;
      settings.isRealtimeWebAnalyticsEnabled = RealTimeSettings.IsRealtimeWebAnalyticsEnabled;
      settings.isRealtimeWebAnalyticsConnectionEventsEnabled =
        RealTimeSettings.IsRealtimeWebAnalyticsConnectionEventsEnabled;
      settings.isRealtimeDurableReplayEnabled = RealTimeSettings.IsRealtimeDurableReplayEnabled;
      settings.isRealtimeTailLossPollingEnabled = RealTimeSettings.IsRealtimeTailLossPollingEnabled;
      settings.realtimeTailLossPollingBaseIntervalMs =
        toInt(RealTimeSettings.RealtimeTailLossPollingBaseIntervalMs) || 30000;
      settings.realtimeTailLossPollingMaxIntervalMs =
        toInt(RealTimeSettings.RealtimeTailLossPollingMaxIntervalMs) || 300000;
      settings.realtimeTailLossPollingBackoffMultiplier =
        parseFloat(String(RealTimeSettings.RealtimeTailLossPollingBackoffMultiplier)) || 2;
      settings.isRealtimeTailLossGapDetectionEnabled =
        RealTimeSettings.IsRealtimeTailLossGapDetectionEnabled;
      settings.realtimeTailLossPollingRetryMaxAttempts =
        toInt(RealTimeSettings.RealtimeTailLossPollingRetryMaxAttempts) || 3;
      settings.realtimeMessageDedupeLruCacheSize =
        toInt(RealTimeSettings.RealtimeMessageDedupeLruCacheSize) || 32;
    } else {
      settings.notificationsUrl = "https://realtime.roblox.com";
      settings.maxConnectionTimeInMs = 21600000; // six hours
      settings.isEventPublishingEnabled = false;
      settings.isDisconnectOnSlowConnectionDisabled = false;
      settings.userId = CurrentUser ? toInt(CurrentUser.userId) : -1;
      settings.isSignalRClientTransportRestrictionEnabled = false;
      settings.isLocalStorageEnabled = false;
      settings.isRealtimeWebAnalyticsEnabled = false;
      settings.isRealtimeWebAnalyticsConnectionEventsEnabled = false;
      settings.isRealtimeDurableReplayEnabled = false;
      settings.isRealtimeTailLossPollingEnabled = false;
      settings.realtimeTailLossPollingBaseIntervalMs = 30000;
      settings.realtimeTailLossPollingMaxIntervalMs = 300000;
      settings.realtimeTailLossPollingBackoffMultiplier = 2;
      settings.isRealtimeTailLossGapDetectionEnabled = false;
      settings.realtimeTailLossPollingRetryMaxAttempts = 3;
      settings.realtimeMessageDedupeLruCacheSize = 32;
    }
  }

  return settings;
};

const getNotificationsUrl = () => getSettings().notificationsUrl;

const getMaximumConnectionTime = () => getSettings().maxConnectionTimeInMs;

const isEventPublishingEnabled = () => getSettings().isEventPublishingEnabled;

const isLocalStorageEnabled = () => {
  const { LocalStorage } = getRealtimeGlobals();
  if (LocalStorage) {
    return LocalStorage.isAvailable() && getSettings().isLocalStorageEnabled;
  }
  // localStorage can be missing when storage access is blocked.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  return localStorage && getSettings().isLocalStorageEnabled;
};

const getUserId = () => getSettings().userId;

export default {
  GetNotificationsUrl: getNotificationsUrl,
  GetMaximumConnectionTime: getMaximumConnectionTime,
  IsEventPublishingEnabled: isEventPublishingEnabled,
  IsLocalStorageEnabled: isLocalStorageEnabled,
  GetUserId: getUserId,
  GetSettings: getSettings,
};
