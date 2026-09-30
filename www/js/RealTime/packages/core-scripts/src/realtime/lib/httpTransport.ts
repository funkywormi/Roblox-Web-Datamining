import { get, post } from "../../http";
import type { UrlConfig } from "../../http";
import httpTransportNextJs from "./httpTransport.nextjs";

export type RealtimeHttpTransport = {
  get: <T>(config: UrlConfig) => Promise<T>;
  post: <T>(config: UrlConfig, data?: object) => Promise<T>;
};

// core-scripts/http (axios) has CSRF/retry/Sentry built in; it wraps the body in { data }.
const legacy: RealtimeHttpTransport = {
  get: async <T>(config: UrlConfig) => (await get<T>(config)).data,
  post: async <T>(config: UrlConfig, data?: object) => (await post<T>(config, data)).data,
};

// NEXT_PUBLIC_IS_NEXTJS is inlined by Next at build; undefined in the .NET Rspack build and under
// jest, so both keep the axios path. On Next the host installs core-lib interceptors (CSRF/retry).
const isNextJs = process.env.NEXT_PUBLIC_IS_NEXTJS === "true";
export default isNextJs ? httpTransportNextJs : legacy;

// axios rejects with the response object (top-level status); core-lib throws HttpError (response.status).
export const getErrorStatus = (error: unknown): number | undefined => {
  if (typeof error !== "object" || error === null) {
    return undefined;
  }
  if ("status" in error && typeof error.status === "number") {
    return error.status;
  }
  if (
    "response" in error &&
    typeof error.response === "object" &&
    error.response !== null &&
    "status" in error.response &&
    typeof error.response.status === "number"
  ) {
    return error.response.status;
  }
  return undefined;
};
