// Must run before www-common realtime evaluates: it can start the client (and fetch) at import.
import "./installHttpTransport";
import realtime from "@rbx/www-common/realtime";

// Re-exported so the window.Roblox external and existing imports stay unchanged.
export type {
  TopicSubscriptionError,
  TopicSubscribeOptions,
  RealtimeClient,
} from "@rbx/www-common/realtime";

export default realtime;
