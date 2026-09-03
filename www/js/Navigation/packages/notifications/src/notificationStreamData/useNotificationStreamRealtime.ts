import { useEffect, useRef } from "react";
import realTime from "@rbx/core-scripts/realtime";
import { reportNotificationStreamError } from "./notificationStreamObservability";

type RealtimeMessage = { Type?: string };

export type NotificationStreamRealtimeHandlers = {
  onNewNotification?: () => void;
  onNotificationsRead?: () => void;
  onNotificationRevoked?: () => void;
};

export const useNotificationStreamRealtime = (
  handlers: NotificationStreamRealtimeHandlers,
): void => {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    const client = realTime.GetClient();
    const callback = (detail: unknown): void => {
      try {
        const data = detail as RealtimeMessage;
        switch (data?.Type) {
          case "NewNotification":
            handlersRef.current.onNewNotification?.();
            break;
          case "NotificationsRead":
            handlersRef.current.onNotificationsRead?.();
            break;
          case "NotificationRevoked":
            handlersRef.current.onNotificationRevoked?.();
            break;
          default:
            break;
        }
      } catch (error) {
        reportNotificationStreamError("realtime", error);
      }
    };
    client.Subscribe("NotificationStream", callback);
    return () => client.Unsubscribe("NotificationStream", callback);
  }, []);
};

export default useNotificationStreamRealtime;
