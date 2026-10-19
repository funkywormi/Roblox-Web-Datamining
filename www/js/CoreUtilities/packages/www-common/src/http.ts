import { getClient, startInactiveSpan } from "@sentry/browser";
import { arrayIncludes, AsyncResult, errAsync, type Result } from "@rbx/core-lib";
import * as http from "@rbx/core-lib/http";
import { HttpError } from "@rbx/core-lib/http";
import { retryInterceptor } from "@rbx/core-lib/http/retry";
import { withResolvers } from "@rbx/core-lib/promise";
import {
  interceptChallenge,
  Migrate,
  parseChallengeSpecificProperties,
  renderChallenge,
} from "@rbx/generic-challenges";
import type {
  InterceptChallengeParameters,
  ParseChallengeSpecificProperties,
  RenderChallenge,
} from "@rbx/generic-challenge-types";
import { buildConfigBoundAuthToken, type UrlConfigForBat } from "./auth/boundAuth";
import { isHbaUnauthorizedError } from "./auth/hbaUnauthorized";
import { UserId } from "./user";
import { Locale, localeToUppercaseDash } from "./locale";

export type LegacyInterceptChallenge = <T>(
  parameters: Omit<InterceptChallengeParameters<T>, "legacyGenericRender"> & {
    newRenderChallenge: RenderChallenge;
    newParseChallenge: ParseChallengeSpecificProperties;
  },
) => Promise<T>;

export type LegacyRenderChallenge = RenderChallenge;

// Challenge interceptors reject when the challenge is abandoned or fails.
const settleChallenge = (
  challenge: Promise<Result<Response, http.FetchError>>,
  error: http.FetchError,
): AsyncResult<Response, http.FetchError> =>
  AsyncResult.fromPromise(challenge, reason => (reason instanceof Error ? reason : error)).andThen(
    result => result,
  );

export const setClientInterceptors = ({
  getUserId,
  getLocale,
  challengeContainerId,
  onHbaUnauthorized,
  legacyInterceptChallenge,
  legacyRenderChallenge,
}: {
  getUserId: () => UserId | null;
  getLocale: () => Locale;
  challengeContainerId: string;
  // Returns whether a sign-in prompt took the 401; the request is held only then.
  onHbaUnauthorized?: () => boolean;
  legacyInterceptChallenge?: LegacyInterceptChallenge;
  legacyRenderChallenge?: LegacyRenderChallenge;
}): void => {
  let csrfToken: string | null = null;
  let hbaUnauthorizedReported = false;

  const csrfTokenHeader = "x-csrf-token";
  const boundAuthTokenHeader = "x-bound-auth-token";
  const xsrfMethods = ["POST", "PATCH", "PUT", "DELETE"] as const;

  http.setInterceptors([
    retryInterceptor,
    next =>
      AsyncResult.fn(async (url, options) => {
        if (csrfToken != null && arrayIncludes(xsrfMethods, options.method)) {
          options.headers.set(csrfTokenHeader, csrfToken);
        }

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

        const batConfig: UrlConfigForBat = {
          url: url.href,
          method: options.method,
          data: typeof options.body === "string" ? options.body : undefined,
        };
        const { headers: batHeaders } = await buildConfigBoundAuthToken(batConfig, userId != null);
        const boundAuthToken = batHeaders?.[boundAuthTokenHeader];
        if (boundAuthToken != null) {
          options.headers.set(boundAuthTokenHeader, String(boundAuthToken));
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

        const requestOptions =
          onHbaUnauthorized == null ? options : { ...options, includeBodyOnError: true };

        const result = await next(url, requestOptions).orElse(error => {
          // Extract this block into a helper function so that when a CSRF token is generated
          // from a response and populated, it correctly renders a generic challenge using
          // the error callback handler
          const handleChallengeResponse = (error: http.FetchError) => {
            if (error instanceof HttpError) {
              const genericChallengeIdHeader = "rblx-challenge-id";
              const genericChallengeTypeHeader = "rblx-challenge-type";
              const genericChallengeMetadataHeader = "rblx-challenge-metadata";

              const responseHeaders = error.response.headers;
              const challengeId = responseHeaders.get(genericChallengeIdHeader);
              const challengeTypeRaw = responseHeaders.get(genericChallengeTypeHeader);
              const challengeMetadataJsonBase64 = responseHeaders.get(
                genericChallengeMetadataHeader,
              );
              if (
                challengeId != null &&
                challengeTypeRaw != null &&
                challengeMetadataJsonBase64 != null
              ) {
                const retryRequest = (
                  challengeIdInner: string,
                  redemptionMetadataJsonBase64: string,
                ) => {
                  options.headers.set(genericChallengeIdHeader, challengeIdInner);
                  options.headers.set(genericChallengeTypeHeader, challengeTypeRaw);
                  options.headers.set(genericChallengeMetadataHeader, redemptionMetadataJsonBase64);
                  return next(url, requestOptions);
                };

                if (Migrate.isSupportedByGrasshopper(challengeTypeRaw)) {
                  return settleChallenge(
                    interceptChallenge({
                      retryRequest,
                      containerId: challengeContainerId,
                      nonce: document.querySelector<HTMLScriptElement>("script[nonce]")?.nonce,
                      challengeId,
                      challengeTypeRaw,
                      challengeMetadataJsonBase64,
                      legacyGenericRender: legacyRenderChallenge,
                    }),
                    error,
                  );
                }
                if (legacyInterceptChallenge != null) {
                  return settleChallenge(
                    legacyInterceptChallenge({
                      retryRequest,
                      containerId: challengeContainerId,
                      challengeId,
                      challengeTypeRaw,
                      challengeMetadataJsonBase64,
                      newRenderChallenge: renderChallenge,
                      newParseChallenge: parseChallengeSpecificProperties,
                    }),
                    error,
                  );
                }
              }
            }

            return errAsync(error);
          };

          const handleHbaOrChallengeResponse = (error: http.FetchError) => {
            if (
              onHbaUnauthorized != null &&
              isHbaUnauthorizedError(error) &&
              (hbaUnauthorizedReported || onHbaUnauthorized())
            ) {
              hbaUnauthorizedReported = true;
              return AsyncResult.fromPromise(withResolvers<Response>().promise, () => error);
            }
            return handleChallengeResponse(error);
          };

          if (
            error instanceof HttpError &&
            error.response.status === 403 &&
            arrayIncludes(xsrfMethods, error.request.method)
          ) {
            const newCsrfToken = error.response.headers.get(csrfTokenHeader);
            if (newCsrfToken != null) {
              csrfToken = newCsrfToken;
              options.headers.set(csrfTokenHeader, csrfToken);
              return next(url, requestOptions).orElse(handleHbaOrChallengeResponse);
            }
          }

          return handleHbaOrChallengeResponse(error);
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
