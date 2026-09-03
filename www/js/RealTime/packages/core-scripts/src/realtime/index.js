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

export default { GetClient: getClient, ...factory };
