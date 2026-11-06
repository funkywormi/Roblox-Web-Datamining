import * as http from "@rbx/core-scripts/http";
import type { RequestConfig } from "./requestConfig";
import requestTransportNextJs from "./requestTransport.nextjs";

export type RequestTransport = {
  get: <T>(config: RequestConfig) => Promise<T>;
  post: <T>(config: RequestConfig, data?: object) => Promise<T>;
};

// Axios stays on .NET until the www-common interceptor renders legacy challenges (WEB-3481): these
// endpoints can return captcha and reauthentication, which only the axios interceptor handles.
// The axios interceptor rejects with the response itself, so callers read `status` and `data` off
// the rejection.
const legacy: RequestTransport = {
  get: <T>(config: RequestConfig): Promise<T> =>
    http.get<T>(config).then(response => response.data),
  post: <T>(config: RequestConfig, data?: object): Promise<T> =>
    http.post<T>(config, data).then(response => response.data),
};

const isNextJs = process.env.NEXT_PUBLIC_IS_NEXTJS === "true";

export default isNextJs ? requestTransportNextJs : legacy;
