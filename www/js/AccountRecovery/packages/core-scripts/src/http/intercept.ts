import axios, { AxiosPromise } from "axios";
import { getClient, startInactiveSpan } from "@sentry/browser";
import {
  interceptChallenge,
  Migrate,
  parseChallengeSpecificProperties,
  renderChallenge,
} from "@rbx/generic-challenges";
import { getToken, setToken } from "../auth/xsrfToken";
import * as endpoints from "../endpoints";
import { isTestSite } from "../meta/environment";
import { setMrRouterHeaders } from "../mrRouter";
import {
  ErrorResponse,
  HttpRequestMethods,
  HttpResponseCodes,
  ResponseConfig,
  UrlConfig,
} from "./types";
import { retryAttemptHeader } from "./util";

const CSRF_TOKEN_HEADER = "x-csrf-token";
const CSRF_INVALID_RESPONSE_CODE = HttpResponseCodes.forbidden;

// Constants for rendering a generic request challenge.
const GENERIC_CHALLENGE_LOG_PREFIX = "Generic Challenge:";
const GENERIC_CHALLENGE_ID_HEADER = "rblx-challenge-id";
const GENERIC_CHALLENGE_TYPE_HEADER = "rblx-challenge-type";
const GENERIC_CHALLENGE_METADATA_HEADER = "rblx-challenge-metadata";
const GENERIC_CHALLENGE_CONTAINER_ID = "generic-challenge-container";
const TRACEPARENT_HEADER = "traceparent";
const RETRY_ATTEMPT_HEADER = "x-retry-attempt";

// Trace propagation targets for Sentry
const tracePropagationTargets = [/roblox\.com/, /robloxlabs\.com/];

let currentToken = getToken();

// @ts-expect-error TODO: old, migrated code
axios.interceptors.request.use((config: UrlConfig) => {
  const { method, noCache, noPragma, headers, url } = config;
  const newConfig = { headers: {}, ...config };
  // if type is post, put, patch, or delete add XsrfToken to header.
  if (
    method === HttpRequestMethods.POST ||
    method === HttpRequestMethods.PATCH ||
    method === HttpRequestMethods.PUT ||
    method === HttpRequestMethods.DELETE
  ) {
    if (!currentToken) {
      currentToken = getToken();
    }
    if (noCache) {
      newConfig.headers = {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: 0,
        ...headers,
      };
    }

    if (noPragma && newConfig.headers.Pragma) {
      delete newConfig.headers.Pragma;
    }

    newConfig.headers[CSRF_TOKEN_HEADER] = currentToken;
  }

  // Overwrite Accept-Language header if necessary
  if (endpoints.supportLocalizedUrls) {
    const acceptLanguageValue = endpoints.getAcceptLanguageValue(url);
    if (acceptLanguageValue) {
      newConfig.headers["Accept-Language"] = acceptLanguageValue;
    }
  }

  newConfig.url = endpoints.appendUrlLocaleParam(newConfig.url, method);

  // Add Sentry traceparent header for trace propagation
  const shouldAddTraceparent = tracePropagationTargets.some(target => {
    if (typeof target === "string") {
      return url.includes(target);
    }
    return url ? target.test(url) : false;
  });

  if (shouldAddTraceparent && getClient() && !newConfig.headers[TRACEPARENT_HEADER]) {
    const sentrySpan = startInactiveSpan({
      name: `${method?.toUpperCase() ?? "GET"} ${url}`,
      op: "http.client",
      attributes: {
        "http.url": url,
        "http.method": method?.toUpperCase() ?? "GET",
      },
    });

    const { traceId, spanId, traceFlags } = sentrySpan.spanContext();
    const sampled = traceFlags & 0x1 ? "01" : "00";
    const traceparent = `00-${traceId}-${spanId}-${sampled}`;

    newConfig.headers[TRACEPARENT_HEADER] = traceparent;

    // Store the span to end it in response interceptor
    newConfig.sentrySpan = sentrySpan;
  }

  // MrRouter MEM headers (sitetest / non-production only; see ENGEFF MEM guide)
  if (isTestSite()) {
    setMrRouterHeaders(newConfig.headers);
  }

  return newConfig;
}, null);

axios.interceptors.response.use(
  (response: ResponseConfig) => {
    const {
      status,
      config: { sentrySpan },
    } = response;

    // End Sentry span if it exists
    if (sentrySpan) {
      sentrySpan.setStatus({ code: 1 }); // OK status
      sentrySpan.setAttribute("http.status_code", status);
      sentrySpan.end();
    }

    return response;
  },
  (error: ErrorResponse): AxiosPromise => {
    const { config: responseConfig, response } = error;
    if (response) {
      const { status, headers, config } = response;
      config.headers ??= {};
      const newToken = headers[CSRF_TOKEN_HEADER];

      // End Sentry span with error status if it exists
      if (config.sentrySpan) {
        config.sentrySpan.setStatus({ code: 2 }); // ERROR status
        config.sentrySpan.setAttribute("http.status_code", status);
        config.sentrySpan.end();
      }

      if (status === CSRF_INVALID_RESPONSE_CODE.valueOf() && newToken) {
        config.headers[CSRF_TOKEN_HEADER] = newToken;
        currentToken = newToken;
        setToken(newToken);
        return axios.request(config);
      }
      if (retryAttemptHeader) {
        // Set retry attempt header before all service failure retries.
        let retryAttempt = 1;
        if (config.headers[RETRY_ATTEMPT_HEADER]) {
          retryAttempt = Number(config.headers[RETRY_ATTEMPT_HEADER]) + 1;
        }
        config.headers[RETRY_ATTEMPT_HEADER] = String(retryAttempt);
      }

      // Handle Generic Challenge headers (keep this logic LAST in this handler
      // since it is effectively an extension of application business logic).
      const {
        [GENERIC_CHALLENGE_ID_HEADER]: challengeId,
        [GENERIC_CHALLENGE_TYPE_HEADER]: challengeTypeRaw,
        [GENERIC_CHALLENGE_METADATA_HEADER]: challengeMetadataJsonBase64,
      } = headers;
      const anyChallengeHeaderFound =
        challengeId !== undefined ||
        challengeTypeRaw !== undefined ||
        challengeMetadataJsonBase64 !== undefined;
      const challengeAvailable =
        challengeId !== undefined &&
        challengeTypeRaw !== undefined &&
        challengeMetadataJsonBase64 !== undefined;

      if (challengeAvailable) {
        const retryRequest = (challengeIdInner: string, redemptionMetadataJsonBase64: string) => {
          config.headers ??= {};
          config.headers[GENERIC_CHALLENGE_ID_HEADER] = challengeIdInner;
          config.headers[GENERIC_CHALLENGE_TYPE_HEADER] = challengeTypeRaw;
          config.headers[GENERIC_CHALLENGE_METADATA_HEADER] = redemptionMetadataJsonBase64;
          return axios.request(config);
        };

        // @ts-expect-error TODO: old, migrated code
        const { AccountIntegrityChallengeService } = window.Roblox;

        // Always attempt the new grasshoper-centralized challenge middleware first.
        if (Migrate.isSupportedByGrasshopper(challengeTypeRaw)) {
          return interceptChallenge({
            retryRequest,
            containerId: GENERIC_CHALLENGE_CONTAINER_ID,
            challengeId,
            challengeTypeRaw,
            challengeMetadataJsonBase64,
            // TODO: old, migrated code
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            legacyGenericRender: AccountIntegrityChallengeService?.Generic.renderChallenge,
          });
        }
        // Or fallback to the globally-bound legacy web challenge middleware.
        if (AccountIntegrityChallengeService) {
          // TODO: old, migrated code
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
          return AccountIntegrityChallengeService.Generic.interceptChallenge({
            retryRequest,
            containerId: GENERIC_CHALLENGE_CONTAINER_ID,
            challengeId,
            challengeTypeRaw,
            challengeMetadataJsonBase64,
            newRenderChallenge: renderChallenge,
            newParseChallenge: parseChallengeSpecificProperties,
          });
        }
        console.error(
          GENERIC_CHALLENGE_LOG_PREFIX,
          "Got challenge but challenge component not available",
        );
      } else if (anyChallengeHeaderFound) {
        console.error(GENERIC_CHALLENGE_LOG_PREFIX, "Got only partial challenge headers");
      }
    }
    // TODO: old, migrated code
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (responseConfig?.fullError || axios.isCancel(error)) {
      // TODO: old, migrated code
      // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
      return Promise.reject(error);
    }

    // TODO: old, migrated code
    // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
    return Promise.reject(response);
  },
);
