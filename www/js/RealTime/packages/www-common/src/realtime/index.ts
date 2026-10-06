import { getClient } from "./lib/client";
import "./lib/coreSignalRConnectionWrapper";
import "./lib/stateTracker";
import "./constants/events";
import "./constants/options";
import "./sources/crossTabReplicatedSource";
import "./sources/hybridSource";
import "./sources/signalRSource";
import "./debugs/debugger";
import "./debugs/startDebugger";
import "./handlers/authenticationNotificationsHandler";
import factory from "./lib/factory";
import { initRealtimeConfig } from "./lib/realtimeConfig";

export type { TopicSubscriptionError, TopicSubscribeOptions, RealtimeClient } from "./lib/types";

// Init(config) supplies the globals on a host without window.Roblox (Next.js), before first GetClient.
export default { GetClient: getClient, Init: initRealtimeConfig, ...factory };
export { setRealtimeHttpTransport, getErrorStatus } from "./lib/httpTransport";
export type { RealtimeHttpTransport, RealtimeUrlConfig } from "./lib/httpTransport";
export type { RealtimeGlobals, RealTimeSettingsGlobal } from "./lib/realtimeConfig";
