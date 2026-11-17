import { captureException } from "@rbx/core-scripts/sentry";

/**
 * Keys the observability framework puts on the flat context map that are not Sentry tags.
 * `componentStack` is a React stack and is too long to index.
 */
const EXTRA_KEYS = new Set(["componentStack"]);

/**
 * Adapter for the `captureException` callback on `@rbx/observability-framework`.
 *
 * Trackers pass `{ error_counter }`. The error boundary also passes `componentStack`.
 * `withApiMetrics` passes `{ call, statusCode }` through the same callback. Sentry expects
 * `{ tags, extra }`, so `componentStack` is extra and every other key is a tag.
 *
 * Import this subpath. `@rbx/core-scripts/sentry` is aliased to a Next.js shim, so this file
 * stays on the real module and calls `captureException`, which reaches `window.Sentry` on .NET
 * and `@sentry/nextjs` on Next.js.
 */
export const captureObservabilityException = (
  error: unknown,
  context?: Record<string, string>,
): void => {
  console.error(error, context);

  if (!context) {
    captureException(error);
    return;
  }

  const tags: Record<string, string> = {};
  const extra: Record<string, string> = {};
  for (const [key, value] of Object.entries(context)) {
    if (EXTRA_KEYS.has(key)) {
      extra[key] = value;
    } else {
      tags[key] = value;
    }
  }

  captureException(error, {
    ...(Object.keys(tags).length > 0 ? { tags } : {}),
    ...(Object.keys(extra).length > 0 ? { extra } : {}),
  });
};
