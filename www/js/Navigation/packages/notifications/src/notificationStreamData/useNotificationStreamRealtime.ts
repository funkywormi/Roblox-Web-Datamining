import { useEffect, useRef } from "react";
import { getNotificationStreamTransport } from "./streamTransport";
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
    try {
      return getNotificationStreamTransport().subscribe("NotificationStream", callback, error =>
        reportNotificationStreamError("realtime", error),
      );
    } catch (error) {
      reportNotificationStreamError("realtime", error);
      return undefined;
    }
  }, []);
};

export default useNotificationStreamRealtime;
