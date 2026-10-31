/**
 * The request options the transport supports: the subset of the axios `UrlConfig` that the request
 * types set.
 */
export type RequestConfig = {
  url: string;
  withCredentials?: boolean;
  timeout?: number;
  headers?: Record<string, string>;
};

export const HttpStatus = {
  unauthorized: 401,
  forbidden: 403,
  notFound: 404,
} as const;
