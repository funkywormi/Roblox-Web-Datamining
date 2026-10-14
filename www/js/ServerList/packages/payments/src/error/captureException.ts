import { window } from "@rbx/core-lib/browser";

export const captureException = (error: unknown, tags?: Record<string, string>) => {
  window?.Sentry?.captureException(error, tags ? { tags } : undefined);
};
