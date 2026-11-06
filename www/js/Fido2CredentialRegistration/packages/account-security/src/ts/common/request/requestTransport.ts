import * as http from "@rbx/core-scripts/http";
import type { RequestConfig } from "./requestConfig";
import requestTransportNextJs from "./requestTransport.nextjs";

export type RequestTransport = {
  get: <T>(config: RequestConfig, params?: object) => Promise<T>;
  post: <T>(config: RequestConfig, data?: object) => Promise<T>;
};

// The axios interceptor rejects with the response itself, so `toResult` reads `status` and `data`
// off the rejection.
const legacy: RequestTransport = {
  get: <T>(config: RequestConfig, params?: object): Promise<T> =>
    http.get<T>(config, params).then(response => response.data),
  post: <T>(config: RequestConfig, data?: object): Promise<T> =>
    http.post<T>(config, data).then(response => response.data),
};

const isNextJs = process.env.NEXT_PUBLIC_IS_NEXTJS === "true";

export default isNextJs ? requestTransportNextJs : legacy;
