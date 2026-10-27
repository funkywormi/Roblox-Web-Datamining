import * as http from "@rbx/core-scripts/http";
import requestTransportNextJs from "./requestTransport.nextjs";

export type RequestConfig = {
  url: string;
  withCredentials?: boolean;
  retryable?: boolean;
};

export type RequestTransport = {
  get: (config: RequestConfig, params?: object) => Promise<{ data: unknown }>;
  post: (config: RequestConfig, data?: object) => Promise<{ data: unknown }>;
};

const legacy: RequestTransport = {
  get: (config: RequestConfig, params?: object) => http.get(config, params),
  post: (config: RequestConfig, data?: object) => http.post(config, data),
};

const isNextJs = process.env.NEXT_PUBLIC_IS_NEXTJS === "true";

export default isNextJs ? requestTransportNextJs : legacy;
