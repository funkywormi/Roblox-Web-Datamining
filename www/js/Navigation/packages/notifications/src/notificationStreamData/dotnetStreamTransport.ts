import realTime from "@rbx/core-scripts/realtime";
import type { ConnectionEventHandler, NotificationStreamTransport } from "./streamTransport";

// SubscribeToConnectionEvents exists on the runtime client but is absent from its published types.
type RealtimeConnectionClient = {
  SubscribeToConnectionEvents: (
    onConnected: ConnectionEventHandler,
    onReconnected: ConnectionEventHandler,
    onDisconnected: () => void,
    namespace: string,
  ) => void;
};

export const dotnetNotificationStreamTransport: NotificationStreamTransport = {
  subscribe: (namespace, callback) => {
    const client = realTime.GetClient();
    client.Subscribe(namespace, callback);
    return () => client.Unsubscribe(namespace, callback);
  },
  subscribeToConnectionEvents: (onConnected, onReconnected, onDisconnected, namespace) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- connection API exists at runtime, missing from published types
    const client = realTime.GetClient() as unknown as RealtimeConnectionClient;
    client.SubscribeToConnectionEvents(onConnected, onReconnected, onDisconnected, namespace);
  },
};
