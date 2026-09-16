import { getClient, startInactiveSpan } from "@sentry/browser";
import { arrayIncludes, AsyncResult, Mutable } from "@rbx/core-lib";
import * as http from "@rbx/core-lib/http";
import {
  type FetchError,
  type FetchFunction,
  HttpError,
  type RequestInfo,
} from "@rbx/core-lib/http";
import { retryInterceptor } from "@rbx/core-lib/http/retry";
import type { Url } from "@rbx/core-lib/url";
import type { InternalUrl } from "@rbx/core-lib/url/internal";
import { UserId } from "./user";
import { Locale, localeToUppercaseDash } from "./locale";

export const setClientInterceptors = ({
  getUserId,
  getLocale,
  gcs,
}: {
  getUserId: () => UserId | null;
  getLocale: () => Locale;
  gcs: (
    url: Url | InternalUrl,
    options: Mutable<RequestInfo>,
    error: FetchError,
    next: FetchFunction,
  ) => AsyncResult<Response, FetchError>;
}): void => {
  let csrfToken: string | null = null;

  const csrfTokenHeader = "x-csrf-token";
  const xsrfMethods = ["POST", "PATCH", "PUT", "DELETE"] as const;

  http.setInterceptors([
    retryInterceptor,
    next =>
      AsyncResult.fn(async (url, options) => {
        if (csrfToken != null && arrayIncludes(xsrfMethods, options.method)) {
          options.headers.set(csrfTokenHeader, csrfToken);
        }

        // TODO: x-bound-auth-token

        const isFirstParty =
          url.host.endsWith(".roblox.com") || url.host.endsWith(".robloxlabs.com");
        const userId = getUserId();

        if (isFirstParty && userId == null) {
          const locale = getLocale();

          // ;q=0.01 is an indicator to the backend that this header is not from the browser's language settings
          options.headers.set("Accept-Language", `${localeToUppercaseDash(locale)};q=0.01`);

          if (options.method === "GET" || options.method === "POST") {
            // eslint-disable-next-line no-param-reassign
            url = url.withSearchParamsAppended({ urlLocale: locale });
          }
        }

        let sentrySpan;
        if (isFirstParty && !options.headers.has("traceparent") && getClient() != null) {
          sentrySpan = startInactiveSpan({
            name: `${options.method} ${url.href}`,
            op: "http.client",
            attributes: {
              "http.url": url.href,
              "http.method": options.method,
            },
          });

          const { traceId, spanId, traceFlags } = sentrySpan.spanContext();
          const sampled = traceFlags & 0x1 ? "01" : "00";
          const traceparent = `00-${traceId}-${spanId}-${sampled}`;

          options.headers.set("traceparent", traceparent);
        }

        const result = await next(url, options).orElse(error => {
          if (
            error instanceof HttpError &&
            error.response.status === 403 &&
            arrayIncludes(xsrfMethods, error.request.method)
          ) {
            const newCsrfToken = error.response.headers.get(csrfTokenHeader);
            if (newCsrfToken != null) {
              csrfToken = newCsrfToken;
              options.headers.set(csrfTokenHeader, csrfToken);
              return next(url, options);
            }
          }

          return gcs(url, options, error, next);
        });

        if (sentrySpan != null) {
          sentrySpan.setStatus({ code: result.isOk() ? 1 : 2 });
          if (result.isOk()) {
            sentrySpan.setAttribute("http.status_code", result.value.status);
          } else if (result.error instanceof HttpError) {
            sentrySpan.setAttribute("http.status_code", result.error.response.status);
          }
          sentrySpan.end();
        }

        return result;
      }),
  ]);
};
