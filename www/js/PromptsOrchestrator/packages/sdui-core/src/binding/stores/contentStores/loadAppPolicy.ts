import environmentUrls from "@rbx/environment-urls";
import * as http from "@rbx/core-lib/http";
import { AbortError, HttpError, type FetchJsonError } from "@rbx/core-lib/http";
import { isRetryableError } from "@rbx/core-lib/http/retry";
import { Url } from "@rbx/core-lib/url";
import { SduiErrorName } from "../../../errors/SduiErrors";
import { reportError } from "../../../errors/SduiLogger";
import { buildRequestSignal } from "../../../transport/sduiRequestSignal";
import type { SduiErrorReporter, SduiPageContext } from "../../../types";
import type { PolicyStore } from "./PolicyStore";

// sdui-core can't import `callBehaviour` from core-scripts (it runs in Next.js too), so it
// fetches the bundle directly, like www-common's presence heartbeat.
// eslint-disable-next-line no-restricted-syntax
export const APP_POLICY_PATH = "/guac-v2/v1/bundles/app-policy";

/** Aborts a stalled request so policy reads don't stay `NotReady`. */
export const APP_POLICY_FETCH_TIMEOUT_MS = 10_000;

/**
 * Delay before each retry after a retryable failure. After the last retry fails,
 * the empty policy stays.
 */
export const APP_POLICY_RETRY_DELAYS_MS: readonly number[] = [30_000, 60_000, 120_000];

export interface LoadAppPolicyDeps {
  errorReporter: SduiErrorReporter;
  pageContext: SduiPageContext;
}

/** A retryable status (408, 429, 5xx), a network error, or our own timeout. */
function isRetryable(error: FetchJsonError): boolean {
  return isRetryableError(error) || (error instanceof AbortError && error.cause.code === "Timeout");
}

function describeFailure(error: FetchJsonError): { statusCode: string; message: string } {
  if (error instanceof HttpError) {
    return { statusCode: String(error.response.status), message: error.message };
  }
  if (error instanceof AbortError && error.cause.code === "Timeout") {
    return {
      statusCode: "timeout",
      message: `app-policy request timed out after ${APP_POLICY_FETCH_TIMEOUT_MS}ms`,
    };
  }
  if (error instanceof AbortError) return { statusCode: "aborted", message: error.message };
  return { statusCode: "unknown", message: error.message };
}

/**
 * Fetch the Guac `app-policy` bundle and push it into `store`. Mirrors lua-apps'
 * `SduiDiscoveryDependencyUpdater`. `PolicyStore` starts this on its first read.
 *
 * Fails closed: on the first failure an empty policy is pushed so every field
 * reads `undefined`. Each failure is reported as `FailedToFetchAppPolicy`. A
 * retryable failure (see `isRetryable`) is retried after the next
 * `APP_POLICY_RETRY_DELAYS_MS` delay; any other failure stops the load. A later
 * success replaces the empty policy.
 */
export async function loadAppPolicy(
  store: PolicyStore,
  deps: LoadAppPolicyDeps,
  attempt = 0,
): Promise<void> {
  const url = Url.parse(environmentUrls.apiGatewayUrl);
  if (url.isErr()) {
    reportError(
      SduiErrorName.FailedToFetchAppPolicy,
      `Invalid API gateway URL: ${url.error.message}`,
      deps.pageContext,
      undefined,
      deps.errorReporter,
    );
    store.setPolicy({});
    return;
  }

  const { signal, cleanup } = buildRequestSignal(APP_POLICY_FETCH_TIMEOUT_MS);
  const result = await http.getUntyped(url.value.withPath(APP_POLICY_PATH), {
    credentials: "include",
    signal,
  });
  cleanup();
  if (result.isOk()) {
    store.setPolicy(result.value);
    return;
  }

  const { statusCode, message } = describeFailure(result.error);
  // `attempt` is a tag so the deduplicating reporter keeps one report per attempt.
  reportError(
    SduiErrorName.FailedToFetchAppPolicy,
    message,
    deps.pageContext,
    undefined,
    deps.errorReporter,
    { additionalTags: { statusCode, attempt } },
  );
  if (attempt === 0) store.setPolicy({});

  const delay = APP_POLICY_RETRY_DELAYS_MS[attempt];
  if (delay === undefined || !isRetryable(result.error)) return;
  setTimeout(() => {
    // eslint-disable-next-line no-void, @rbx/promises/prefer-query-mutation -- retry runs outside React; failures are reported inside
    void loadAppPolicy(store, deps, attempt + 1);
  }, delay);
}
