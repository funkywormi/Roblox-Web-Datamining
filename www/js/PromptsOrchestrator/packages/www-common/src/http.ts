import { getClient, startInactiveSpan } from "@sentry/browser";
import { arrayIncludes, AsyncResult, errAsync } from "@rbx/core-lib";
import * as http from "@rbx/core-lib/http";
import { HttpError } from "@rbx/core-lib/http";
import { retryInterceptor } from "@rbx/core-lib/http/retry";
// import { interceptChallenge, Migrate } from "@rbx/generic-challenges";
import { UserId } from "./user";
import { Locale, localeToUppercaseDash } from "./locale";

export const setClientInterceptors = ({
  getUserId,
  getLocale,
}: {
  getUserId: () => UserId | null;
  getLocale: () => Locale;
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

          // TODO: https://roblox.atlassian.net/browse/UBIQUITY-2745
          // if (error instanceof HttpError) {
          //   const genericChallengeIdHeader = "rblx-challenge-id";
          //   const genericChallengeTypeHeader = "rblx-challenge-type";
          //   const genericChallengeMetadataHeader = "rblx-challenge-metadata";

          //   const responseHeaders = error.response.headers;
          //   const challengeId = responseHeaders.get(genericChallengeIdHeader);
          //   const challengeTypeRaw = responseHeaders.get(genericChallengeTypeHeader);
          //   const challengeMetadataJsonBase64 = responseHeaders.get(genericChallengeMetadataHeader);
          //   if (
          //     challengeId != null &&
          //     challengeTypeRaw != null &&
          //     challengeMetadataJsonBase64 != null
          //   ) {
          //     if (Migrate.isSupportedByGrasshopper(challengeTypeRaw)) {
          //       return interceptChallenge({
          //         retryRequest: (challengeIdInner, redemptionMetadataJsonBase64) => {
          //           options.headers.set(genericChallengeIdHeader, challengeIdInner);
          //           options.headers.set(genericChallengeTypeHeader, challengeTypeRaw);
          //           options.headers.set(
          //             genericChallengeMetadataHeader,
          //             redemptionMetadataJsonBase64,
          //           );
          //           return next(url, options);
          //         },
          //         containerId: challengeContainerId,
          //         challengeId,
          //         challengeTypeRaw,
          //         challengeMetadataJsonBase64,
          //       });
          //     } else {
          //       // TODO: log error
          //     }
          //   }
          // }

          return errAsync(error);
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
