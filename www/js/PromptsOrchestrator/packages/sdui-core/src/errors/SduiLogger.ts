import type { SduiErrorReporter, SduiErrorDimensions, SduiPageContext } from "../types";

/**
 * Process-scoped dedup set: each unique error fingerprint forwards once per
 * session. SSR processes are per-request so the set resets naturally; in CSR
 * the set persists across navigations within a tab. A single misconfigured
 * template can't drown the dashboard.
 *
 * Key fields parity-aligned with lua `SduiLogger.makeErrorKey`, plus
 * `appPage` / `bindingPath` / `contentType` for finer-grained web buckets.
 * `errorMessage` is intentionally excluded — same fingerprint, different
 * message still dedupes; pick a different `errorType` for a separate event.
 */
const seenErrorKeys = new Set<string>();

function buildDedupKey(
  errorType: string,
  pageContext?: SduiPageContext,
  dimensions?: SduiErrorDimensions,
): string {
  return [
    errorType,
    pageContext?.appPage ?? "",
    dimensions?.name ?? "",
    dimensions?.componentType ?? "",
    dimensions?.parserName ?? "",
    dimensions?.propName ?? "",
    dimensions?.bindingPath ?? "",
    dimensions?.contentType ?? "",
    dimensions?.actionType ?? "",
  ].join("|");
}

/**
 * Forward an SDUI error to the host reporter (or `console.warn` in dev when
 * none is supplied). First occurrence per dedup fingerprint fires; repeats
 * are silently dropped — see `seenErrorKeys` above for the key shape.
 */
export function reportError(
  errorType: string,
  message: string,
  pageContext?: SduiPageContext,
  dimensions?: SduiErrorDimensions,
  errorReporter?: SduiErrorReporter,
): void {
  const key = buildDedupKey(errorType, pageContext, dimensions);
  if (seenErrorKeys.has(key)) return;
  seenErrorKeys.add(key);

  if (errorReporter) {
    errorReporter.reportSduiError(errorType, message, pageContext, dimensions);
    return;
  }

  // TODO (SSR Support): replace with centralized env util when supporting SSR
  if (process.env.NODE_ENV !== "production") {
    console.warn(`[sdui-core] ${errorType}: ${message}`);
  }
}

/** Test-only: clear the dedup set. Production code must not call this. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- `__` prefix is a package convention for test-only exports (mirrors EntityStore / UnkeyedStore).
export function __resetForTesting(): void {
  seenErrorKeys.clear();
}
