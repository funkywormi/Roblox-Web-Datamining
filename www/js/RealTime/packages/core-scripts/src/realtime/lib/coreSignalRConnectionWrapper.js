import * as signalR from "@microsoft/signalr";

const coreSignalRConnectionWrapper = function (
  settings,
  logger,
  onConnectionStatusChangedCallback,
  onNotificationCallback,
  onSubscriptionStatusCallback,
  onTopicNotificationCallback,
  connectionEventCallback,
  onTopicSubscriptionErrorCallback,
  onTopicTokenExpiryCallback,
) {
  // TODO: old, migrated code
  // eslint-disable-next-line no-invalid-this
  const self = this;

  // Initialize values
  let userNotificationConnection = null;
  let isConnected = false;

  const getExponentialBackoff = () => {
    const { Utilities } = window.Roblox;
    if (!Utilities) {
      return false;
    }
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

    const fastBackoffPredicate = exponentialBackoff => {
      const lastSuccessfulConnection = exponentialBackoff.GetLastResetTime();

      // If we are attempting to reconnect again shortly after having reconnected, it may indicate
      // server instability, in which case we should backoff more quickly
      if (
        lastSuccessfulConnection &&
        lastSuccessfulConnection + fastBackoffThreshold > new Date().getTime()
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

  const log = (...parts) => {
    if (logger) {
      logger(parts.join(" "));
    }
  };

  const handleSignalRStateChange = connectionState => {
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
          handleSignalRStateChange(userNotificationConnection.state);
        })
        .catch(err => {
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

  const handleSignalRDisconnected = connectionState => {
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
      handleSignalRDisconnected(userNotificationConnection.state);
    });

    return userNotificationConnection;
  };

  const start = () => {
    userNotificationConnection = getNewSignalRConnection();
    userNotificationConnection
      .start()
      .then(() => {
        handleSignalRStateChange(userNotificationConnection.state);
      })
      .catch(err => {
        log("FAILED to connect to Core SignalR", err);
      });
  };

  const stop = () => {
    if (userNotificationConnection) {
      userNotificationConnection.onclose(() => undefined); // Need to unbind the onclose callback, or else we will automatically perform the handleSignalRDisconnected callback which will try to set up a new connection
      userNotificationConnection.stop();
      userNotificationConnection = null;
    }
    onConnectionStatusChangedCallback(false);
  };

  const restart = () => {
    if (userNotificationConnection === null) {
      start();
    } else {
      userNotificationConnection.stop(); // We will automatically perform the handleSignalRDisconnected callback which will try to set up a new connection
    }
  };

  const getIsConnected = () => isConnected;

  const getConnection = () => userNotificationConnection;

  // Interface
  self.Start = start;
  self.Stop = stop;
  self.Restart = restart;
  self.IsConnected = getIsConnected;
  self.GetConnection = getConnection;
};

export default coreSignalRConnectionWrapper;
