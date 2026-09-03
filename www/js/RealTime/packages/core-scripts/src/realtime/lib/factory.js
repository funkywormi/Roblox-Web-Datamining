let settings = null;
const getSettings = () => {
  if (settings === null) {
    settings = {};
    const { RealTimeSettings, CurrentUser } = window.Roblox;
    if (RealTimeSettings) {
      settings.notificationsUrl = RealTimeSettings.NotificationsEndpoint;
      settings.maxConnectionTimeInMs = parseInt(RealTimeSettings.MaxConnectionTime, 10); // six hours
      settings.isEventPublishingEnabled = RealTimeSettings.IsEventPublishingEnabled;
      settings.isDisconnectOnSlowConnectionDisabled =
        RealTimeSettings.IsDisconnectOnSlowConnectionDisabled;
      settings.userId = CurrentUser ? parseInt(CurrentUser.userId, 10) : -1;
      settings.isSignalRClientTransportRestrictionEnabled =
        RealTimeSettings.IsSignalRClientTransportRestrictionEnabled;
      settings.isLocalStorageEnabled = RealTimeSettings.IsLocalStorageInRealTimeEnabled;
      settings.isRealtimeWebAnalyticsEnabled = RealTimeSettings.IsRealtimeWebAnalyticsEnabled;
      settings.isRealtimeWebAnalyticsConnectionEventsEnabled =
        RealTimeSettings.IsRealtimeWebAnalyticsConnectionEventsEnabled;
      settings.isRealtimeDurableReplayEnabled = RealTimeSettings.IsRealtimeDurableReplayEnabled;
      settings.isRealtimeTailLossPollingEnabled = RealTimeSettings.IsRealtimeTailLossPollingEnabled;
      settings.realtimeTailLossPollingBaseIntervalMs =
        parseInt(RealTimeSettings.RealtimeTailLossPollingBaseIntervalMs, 10) || 30000;
      settings.realtimeTailLossPollingMaxIntervalMs =
        parseInt(RealTimeSettings.RealtimeTailLossPollingMaxIntervalMs, 10) || 300000;
      settings.realtimeTailLossPollingBackoffMultiplier =
        parseFloat(RealTimeSettings.RealtimeTailLossPollingBackoffMultiplier) || 2;
      settings.isRealtimeTailLossGapDetectionEnabled =
        RealTimeSettings.IsRealtimeTailLossGapDetectionEnabled;
      settings.realtimeTailLossPollingRetryMaxAttempts =
        parseInt(RealTimeSettings.RealtimeTailLossPollingRetryMaxAttempts, 10) || 3;
      settings.realtimeMessageDedupeLruCacheSize =
        parseInt(RealTimeSettings.RealtimeMessageDedupeLruCacheSize, 10) || 32;
    } else {
      settings.notificationsUrl = "https://realtime.roblox.com";
      settings.maxConnectionTimeInMs = 21600000; // six hours
      settings.isEventPublishingEnabled = false;
      settings.isDisconnectOnSlowConnectionDisabled = false;
      settings.userId = CurrentUser ? parseInt(CurrentUser.userId, 10) : -1;
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
  const { LocalStorage } = window.Roblox;
  if (LocalStorage) {
    return LocalStorage.isAvailable() && getSettings().isLocalStorageEnabled;
  }
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
