import * as signalR from "@microsoft/signalr";
import type { RealtimeSettings } from "./factory";
import { getRealtimeGlobals, type ExponentialBackoff } from "./realtimeConfig";
import * as localBackoff from "./exponentialBackoff";
import type {
  Logger,
  TopicNotificationHandler,
  TopicSubscriptionErrorHandler,
  TopicTokenExpiryHandler,
} from "./types";

export type CoreSignalRConnection = {
  Start: () => void;
  Stop: () => void;
  Restart: () => void;
  IsConnected: () => boolean;
  GetConnection: () => signalR.HubConnection | null;
};

const coreSignalRConnectionWrapper = function (
  this: CoreSignalRConnection,
  settings: RealtimeSettings,
  logger: Logger | undefined,
  onConnectionStatusChangedCallback: (isConnected: boolean) => void,
  onNotificationCallback: (namespace: string, detail: string, sequenceNumber: number) => void,
  onSubscriptionStatusCallback: (updateType: string, detailString: string) => void,
  onTopicNotificationCallback: TopicNotificationHandler,
  connectionEventCallback: (connectionState: signalR.HubConnectionState) => void,
  onTopicSubscriptionErrorCallback: TopicSubscriptionErrorHandler,
  onTopicTokenExpiryCallback: TopicTokenExpiryHandler,
) {
  // Initialize values
  let userNotificationConnection: signalR.HubConnection | null = null;
  let isConnected = false;

  // Throws like the JS did if the connection was stopped mid-start.
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const currentState = () => userNotificationConnection!.state;

  const getExponentialBackoff = () => {
    const Utilities = getRealtimeGlobals().Utilities ?? localBackoff;
    // Exponential Backoff Configuration
    const regularBackoffSpec = new Utilities.ExponentialBackoffSpecification({
      firstAttemptDelay: 2000,
      firstAttemptRandomnessFactor: 3,
      subsequentDelayBase: 10000,
      subsequentDelayRandomnessFactor: 0.5,
      maximumDelayBase: 300000,
    });
    const fastBackoffSpec = new Utilities.ExponentialBackoffSpecification({
      firstAttemptDelay: 20000,
      firstAttemptRandomnessFactor: 0.5,
      subsequentDelayBase: 40000,
      subsequentDelayRandomnessFactor: 0.5,
      maximumDelayBase: 300000,
    });
    const fastBackoffThreshold = 60000; // maximum time between reconnects to trigger fast backoff mode

    const fastBackoffPredicate = (exponentialBackoff: ExponentialBackoff) => {
      const lastSuccessfulConnection = exponentialBackoff.GetLastResetTime();

      // If we are attempting to reconnect again shortly after having reconnected, it may indicate
      // server instability, in which case we should backoff more quickly
      if (
        lastSuccessfulConnection &&
        lastSuccessfulConnection + fastBackoffThreshold > Date.now()
      ) {
        return true;
      }
      return false;
    };

    return new Utilities.ExponentialBackoff(
      regularBackoffSpec,
      fastBackoffPredicate,
      fastBackoffSpec,
    );
  };

  const exponentialBackoff = getExponentialBackoff();

  const log = (...parts: unknown[]) => {
    if (logger) {
      logger(parts.join(" "));
    }
  };

  const handleSignalRStateChange = (connectionState: signalR.HubConnectionState) => {
    if (connectionState === signalR.HubConnectionState.Connected) {
      // only emit event on connected, because disconnected event
      // is emitted in handleSignalRDisconnected
      if (settings.isRealtimeWebAnalyticsConnectionEventsEnabled) {
        connectionEventCallback(connectionState);
      }
      isConnected = true;
      onConnectionStatusChangedCallback(true);
    } else if (connectionState === signalR.HubConnectionState.Disconnected) {
      isConnected = false;
      onConnectionStatusChangedCallback(false);
    }
  };

  const scheduleReconnect = () => {
    const delay = exponentialBackoff.StartNewAttempt();
    log(`In Disconnection handler. Will attempt Reconnect after ${delay}ms`);

    setTimeout(() => {
      if (userNotificationConnection == null) {
        return;
      }
      userNotificationConnection
        .start()
        .then(() => {
          log("Reconnect succeeded.");
          exponentialBackoff.Reset();
          handleSignalRStateChange(currentState());
        })
        .catch((err: unknown) => {
          log("Connection after Disconnection unsuccessful. err:", err);
          // Only now is the connection known to be lost rather than rotating: Restart() closes
          // the socket deliberately, so reporting on close alone flags every benign rotation.
          onConnectionStatusChangedCallback(false);
          // A rejected start() never opened a connection, so onclose does not fire and
          // nothing else re-arms the backoff.
          scheduleReconnect();
        });
    }, delay);
  };

  const handleSignalRDisconnected = (connectionState: signalR.HubConnectionState) => {
    if (settings.isRealtimeWebAnalyticsConnectionEventsEnabled) {
      connectionEventCallback(connectionState);
    }

    if (connectionState === signalR.HubConnectionState.Disconnected) {
      isConnected = false;
      scheduleReconnect();
    }
  };

  const getNewSignalRConnection = () => {
    userNotificationConnection = new signalR.HubConnectionBuilder()
      .withUrl(settings.notificationsUrl, {
        transport: signalR.HttpTransportType.WebSockets,
        skipNegotiation: true,
      })
      .build();

    userNotificationConnection.on("notification", onNotificationCallback);
    userNotificationConnection.on("subscriptionStatus", onSubscriptionStatusCallback);
    userNotificationConnection.on("topicNotification", onTopicNotificationCallback);
    userNotificationConnection.on("topicSubscriptionError", onTopicSubscriptionErrorCallback);
    userNotificationConnection.on("topicTokenExpiry", onTopicTokenExpiryCallback);

    // Connect to handleSignalRDisconnected when connection closes (disconnects)
    // Since our Core Signal R does not reconnect, we do not need a callback on reconnect
    userNotificationConnection.onclose(() => {
      handleSignalRDisconnected(currentState());
    });

    return userNotificationConnection;
  };

  const start = () => {
    userNotificationConnection = getNewSignalRConnection();
    userNotificationConnection
      .start()
      .then(() => {
        handleSignalRStateChange(currentState());
      })
      .catch((err: unknown) => {
        log("FAILED to connect to Core SignalR", err);
      });
  };

  const stop = () => {
    if (userNotificationConnection) {
      userNotificationConnection.onclose(() => undefined); // Need to unbind the onclose callback, or else we will automatically perform the handleSignalRDisconnected callback which will try to set up a new connection
      // Left unobserved as before.
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      userNotificationConnection.stop();
      userNotificationConnection = null;
    }
    onConnectionStatusChangedCallback(false);
  };

  const restart = () => {
    if (userNotificationConnection === null) {
      start();
    } else {
      // Left unobserved as before.
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      userNotificationConnection.stop(); // We will automatically perform the handleSignalRDisconnected callback which will try to set up a new connection
    }
  };

  const getIsConnected = () => isConnected;

  const getConnection = () => userNotificationConnection;

  // Interface
  this.Start = start;
  this.Stop = stop;
  this.Restart = restart;
  this.IsConnected = getIsConnected;
  this.GetConnection = getConnection;
};

// Called with new; typed as a constructor at this boundary.
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
export default coreSignalRConnectionWrapper as unknown as new (
  ...args: Parameters<typeof coreSignalRConnectionWrapper>
) => CoreSignalRConnection;
