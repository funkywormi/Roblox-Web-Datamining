export const realtimeEvents = {
  Notification: "Roblox.RealTime.Events.Notification",
  ConnectionEvent: "Roblox.RealTime.Events.ConnectionEvent",
  RequestForConnectionStatus: "Roblox.RealTime.Events.RequestForConnectionStatus",
};

// Topic-based notification channels
// Uses localStorage for cross-tab communication
export const topicChannels = {
  Notification: "Roblox.RealTime.Topic.LocalStorage.Notification",
  SubscribeRequest: "Roblox.RealTime.Topic.LocalStorage.SubscribeRequest",
  UnsubscribeRequest: "Roblox.RealTime.Topic.LocalStorage.UnsubscribeRequest",
  LeaderReconnected: "Roblox.RealTime.Topic.LocalStorage.LeaderReconnected",
  SubscriptionError: "Roblox.RealTime.Topic.LocalStorage.SubscriptionError",
  TokenExpiry: "Roblox.RealTime.Topic.LocalStorage.TokenExpiry",
};
