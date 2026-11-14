import { useEffect, useState } from "react";
import { reportNotificationStreamError } from "./notificationStreamObservability";
import { type ConnectionEventHandler, getNotificationStreamTransport } from "./streamTransport";

const NAMESPACE = "NotificationStream";
// Angular's signalRDisconnectionResponseInMilliseconds default (notifications-api MetadataSettings).
const NO_CONNECTION_DELAY_MS = 3000;

let disconnectionDelayMs = NO_CONNECTION_DELAY_MS;
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

const onRegisterFailed = (error: unknown): void => {
  registered = false;
  reportNotificationStreamError("realtimeConnection", error);
};

// The client has no unsubscribe for connection events and the shell remounts on every popover open,
// so registration is anchored at module scope and runs once per page.
const ensureRegistered = (): void => {
  if (registered) {
    return;
  }
  registered = true;
  try {
    const onRestored: ConnectionEventHandler = () => {
      clearTimer();
      emit(false);
    };
    const onDisconnected = (): void => {
      clearTimer();
      timer = setTimeout(() => {
        timer = null;
        emit(true);
      }, disconnectionDelayMs);
    };
    const subscribed = getNotificationStreamTransport().subscribeToConnectionEvents(
      onRestored,
      onRestored,
      onDisconnected,
      NAMESPACE,
    );
    subscribed?.catch(onRegisterFailed);
  } catch (error) {
    onRegisterFailed(error);
  }
};

export const useNotificationStreamConnection = (
  delayMs?: number,
): { isConnectionLost: boolean } => {
  if (delayMs != null && delayMs > 0) {
    disconnectionDelayMs = delayMs;
  }
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
