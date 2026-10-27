import * as http from "@rbx/core-scripts/http";
import requestTransportNextJs from "./requestTransport.nextjs";

export type RequestConfig = {
  url: string;
  withCredentials?: boolean;
  retryable?: boolean;
  headers?: Record<string, string>;
};

// Callers name the response type, as with core-scripts http.
/* eslint-disable @typescript-eslint/no-unnecessary-type-parameters */
export type RequestTransport = {
  get: <T>(config: RequestConfig, params?: object) => Promise<{ data: T }>;
  post: <T>(config: RequestConfig, data?: object) => Promise<{ data: T }>;
};

const legacy: RequestTransport = {
  get: <T>(config: RequestConfig, ...params: [object?]) => http.get<T>(config, ...params),
  post: <T>(config: RequestConfig, ...data: [object?]) => http.post<T>(config, ...data),
};

const isNextJs = process.env.NEXT_PUBLIC_IS_NEXTJS === "true";

export const { parseErrorCode } = http;

export default isNextJs ? requestTransportNextJs : legacy;
