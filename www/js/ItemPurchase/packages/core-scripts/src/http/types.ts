import { AxiosResponse, AxiosRequestConfig } from "axios";
import { Span as SentrySpan } from "@sentry/browser";

export enum HttpResponseCodes {
  ok = 200,
  accepted = 202,
  movedPermanently = 301,
  badRequest = 400,
  unauthorized = 401,
  forbidden = 403,
  notFound = 404,
  methodNotAllowed = 405,
  conflict = 409,
  payloadTooLarge = 413,
  tooManyAttempts = 429,
  serverError = 500,
  serviceUnavailable = 503,
}

export enum HttpRequestMethods {
  GET = "get",
  HEAD = "head",
  POST = "post",
  PUT = "put",
  DELETE = "delete",
  OPTIONS = "options",
  PATCH = "patch",
}

export interface ResponseConfig extends AxiosResponse {
  status: number;
  headers: Record<string, string>;
  config: {
    url?: string;
    sentrySpan?: SentrySpan;
    headers?: Record<string, string>;
  };
}

export interface UrlConfig extends AxiosRequestConfig {
  url: string;
  withCredentials?: boolean;
  retryable?: boolean;
  noCache?: boolean;
  fullError?: boolean;
  noPragma?: boolean;
  authBearerToken?: string;
  headers?: Record<string, string | number | undefined>;
  sentrySpan?: SentrySpan;
  isDuplicate?: boolean;
}

export type ErrorResponse = {
  config: UrlConfig;
  request?: XMLHttpRequest;
  response?: ResponseConfig;
  message?: string;
};
