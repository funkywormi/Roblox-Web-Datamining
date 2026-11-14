import * as http from "@rbx/core-scripts/http";

export type StreamUrlConfig = { url: string; withCredentials: boolean; retryable?: boolean };

export type StreamResponse<T> = { data: T; status: number };

export type ConnectionEventHandler = (dataReloadRequired: boolean) => void;

export type NotificationStreamTransport = {
  subscribe: (
    namespace: string,
    callback: (detail: unknown) => void,
    onError?: (error: unknown) => void,
  ) => () => void;
  subscribeToConnectionEvents: (
    onConnected: ConnectionEventHandler,
    onReconnected: ConnectionEventHandler,
    onDisconnected: () => void,
    namespace: string,
  ) => void | Promise<void>;
};

let transport: NotificationStreamTransport | undefined;

export const registerNotificationStreamTransport = (next: NotificationStreamTransport): void => {
  transport = next;
};

export const getNotificationStreamTransport = (): NotificationStreamTransport => {
  if (transport == null) {
    throw new Error("No notification stream transport is registered");
  }
  return transport;
};

export const streamGet = <T>(config: StreamUrlConfig): Promise<T | undefined> =>
  http.get<T>(config).then(({ data }) => data);

export const streamPost = <T = unknown>(
  config: StreamUrlConfig,
  body: Record<string, unknown>,
): Promise<StreamResponse<T>> => http.post<T>(config, body);

export const streamDelete = (
  config: StreamUrlConfig,
  body: Record<string, unknown>,
): Promise<unknown> => http.delete(config, body);
