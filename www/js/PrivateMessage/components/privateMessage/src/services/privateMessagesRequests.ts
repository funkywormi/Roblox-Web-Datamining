import * as http from "@rbx/core-scripts/http";
import { callBehaviour } from "@rbx/core-scripts/guac";
import type { JsonSerializable } from "@rbx/core-lib/json";
import privateMessagesRequestsNextJs from "./privateMessagesRequests.nextjs";

// Transport seam for privateMessagesService: isolate the HTTP/guac calls behind this factory so the
// service's normalization logic stays single-source instead of forking a `.nextjs` sibling. Only
// this Axios transport is throwaway once the .NET path is removed. `get`/`post` return the unwrapped
// value (T) — callers never touch `.data`.
export type MessageUrlConfig = {
  url: string;
  noCache?: boolean;
  retryable?: boolean;
  withCredentials?: boolean;
};

// A JSON object satisfies both core-scripts http (wants `object`) and core-lib postUntyped
// (wants `JsonSerializable`); every caller passes an object literal.
export type MessageBody = Record<string, JsonSerializable>;

export type PrivateMessagesTransport = {
  get: <T>(urlConfig: MessageUrlConfig, params?: object) => Promise<T>;
  post: <T>(urlConfig: MessageUrlConfig, body?: MessageBody) => Promise<T>;
  getGuacBundle: <T>(bundleName: string) => Promise<T>;
};

// Legacy Axios transport: unwrap `.data` here so the service is backend-agnostic.
const legacy: PrivateMessagesTransport = {
  get: <T>(urlConfig: MessageUrlConfig, params?: object): Promise<T> =>
    http.get<T>(urlConfig, params).then((response: { data: T }) => response.data),

  post: <T>(urlConfig: MessageUrlConfig, body?: MessageBody): Promise<T> =>
    http.post<T>(urlConfig, body).then((response: { data: T }) => response.data),

  getGuacBundle: <T>(bundleName: string): Promise<T> => {
    const params = new URLSearchParams();
    params.append("version", "1");
    return callBehaviour<T>(bundleName, params);
  },
};

// NEXT_PUBLIC_IS_NEXTJS is inlined at build time by Next.js; undefined in the Rspack SCS build,
// so the Axios transport is used for .NET.
const isNextJs = process.env.NEXT_PUBLIC_IS_NEXTJS === "true";

export default isNextJs ? privateMessagesRequestsNextJs : legacy;
