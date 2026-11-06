import * as http from "@rbx/core-lib/http";
import type { RequestOptions } from "@rbx/core-lib/http";
import type { JsonSerializable } from "@rbx/core-lib/json";
import { Url } from "@rbx/core-lib/url";
import type { RequestConfig } from "./requestConfig";
import type { RequestTransport } from "./requestTransport";

const buildOptions = (config: RequestConfig): RequestOptions => ({
  includeBodyOnError: true,
  ...(config.withCredentials ? { credentials: "include" as const } : {}),
});

/** Carries `status` and `data` at the top level, the shape the axios interceptor rejects with. */
export class RequestTransportError extends Error {
  constructor(
    readonly status: number,
    readonly data: unknown,
    options?: ErrorOptions,
  ) {
    super(`Request failed with status ${status}`, options);
  }
}

const normalizeError = (error: unknown): Error => {
  if (error instanceof http.HttpError) {
    const { status, body } = error.response;
    let data: unknown = body;
    if (typeof body === "string") {
      try {
        data = JSON.parse(body);
      } catch {
        data = body;
      }
    }
    return new RequestTransportError(status, data, { cause: error });
  }
  return error instanceof Error ? error : new Error(String(error), { cause: error });
};

const nextjs: RequestTransport = {
  // The URL is parsed inside the promise so a parse failure rejects instead of throwing.
  get: <T>(config: RequestConfig): Promise<T> => {
    const body = Promise.resolve().then(() =>
      http.getUntyped(Url.parse(config.url).getOrThrow(), buildOptions(config)).getOrThrow(),
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    return (body as unknown as Promise<T>).catch((error: unknown) => {
      throw normalizeError(error);
    });
  },
  post: <T>(config: RequestConfig, data?: object): Promise<T> => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    const payload = (data ?? {}) as JsonSerializable;
    const body = Promise.resolve().then(() =>
      http
        .postUntyped(Url.parse(config.url).getOrThrow(), payload, buildOptions(config))
        .getOrThrow(),
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    return (body as unknown as Promise<T>).catch((error: unknown) => {
      throw normalizeError(error);
    });
  },
};

export default nextjs;
