import { useEffect, useState } from "react";
import realTime from "@rbx/core-scripts/realtime";
import { reportNotificationStreamError } from "./notificationStreamObservability";

const NAMESPACE = "NotificationStream";
// Angular's signalRDisconnectionResponseInMilliseconds default (notifications-api MetadataSettings).
const NO_CONNECTION_DELAY_MS = 3000;

type ConnectionEventHandler = (dataReloadRequired: boolean) => void;

// SubscribeToConnectionEvents exists on the runtime client but is absent from its published types.
type RealtimeConnectionClient = {
  SubscribeToConnectionEvents: (
    onConnected: ConnectionEventHandler,
    onReconnected: ConnectionEventHandler,
    onDisconnected: () => void,
    namespace: string,
  ) => void;
};

let connectionLost = false;
let registered = false;
let timer: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<(value: boolean) => void>();

const emit = (value: boolean): void => {
  connectionLost = value;
  listeners.forEach(listener => listener(value));
};

const clearTimer = (): void => {
  if (timer !== null) {
    clearTimeout(timer);
    timer = null;
  }
};

// The client has no unsubscribe for connection events and the shell remounts on every popover open,
// so registration is anchored at module scope and runs once per page.
const ensureRegistered = (): void => {
  if (registered) {
    return;
  }
  registered = true;
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- connection API exists at runtime, missing from published types
    const client = realTime.GetClient() as unknown as RealtimeConnectionClient;
    const onRestored: ConnectionEventHandler = () => {
      clearTimer();
      emit(false);
    };
    const onDisconnected = (): void => {
      clearTimer();
      timer = setTimeout(() => {
        timer = null;
        emit(true);
      }, NO_CONNECTION_DELAY_MS);
    };
    client.SubscribeToConnectionEvents(onRestored, onRestored, onDisconnected, NAMESPACE);
  } catch (error) {
    registered = false;
    reportNotificationStreamError("realtimeConnection", error);
  }
};

export const useNotificationStreamConnection = (): { isConnectionLost: boolean } => {
  const [isConnectionLost, setIsConnectionLost] = useState(connectionLost);
  useEffect(() => {
    ensureRegistered();
    setIsConnectionLost(connectionLost);
    listeners.add(setIsConnectionLost);
    return () => {
      listeners.delete(setIsConnectionLost);
    };
  }, []);
  return { isConnectionLost };
};

export default useNotificationStreamConnection;
