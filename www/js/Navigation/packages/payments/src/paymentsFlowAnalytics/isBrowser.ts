import { document, window } from "@rbx/core-lib/browser";

export const isBrowser = (): boolean => window != null && document != null;
