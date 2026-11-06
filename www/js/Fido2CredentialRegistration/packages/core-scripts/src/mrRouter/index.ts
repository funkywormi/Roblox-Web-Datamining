import {
  getMrRouterConfig,
  getMrRouterEnvName,
  setMrRouterEnvName,
  SSR_COOKIE_NAME,
} from "./config";
import { mergeMrRouterTracestate, TRACESTATE_HEADER } from "./tracestate";

const readme = `# MrRouter
Questions? Ask in #ee-tft
- setMrRouterEnvName({env name}): set MrRouter env name to use on all requests. Also sets a cookie (${SSR_COOKIE_NAME}) for SSR to use the same env name.
- getMrRouterEnvName(): returns current MrRouter env name`;

const TRACEPARENT_HEADER = "traceparent";

// jest/jsdom doesn't have crypto.randomUUID, so we need to use a fallback
const hasRandomUUID = typeof crypto.randomUUID === "function";

const randomHex = (byteCount: number): string => {
  const bytes = new Uint8Array(byteCount);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, byte => byte.toString(16).padStart(2, "0")).join("");
};

const randomTraceId = (): string =>
  hasRandomUUID ? crypto.randomUUID().replace(/-/g, "").slice(0, 32) : randomHex(16);

const randomSpanId = (): string =>
  hasRandomUUID ? crypto.randomUUID().replace(/-/g, "").slice(0, 16) : randomHex(8);

const setMrRouterHeaders = (headers: Record<string, string | number | undefined>): void => {
  const { envName } = getMrRouterConfig();

  if (envName.length > 0) {
    // eslint-disable-next-line no-param-reassign
    headers[TRACESTATE_HEADER] = mergeMrRouterTracestate(
      typeof headers[TRACESTATE_HEADER] === "string" ? headers[TRACESTATE_HEADER] : undefined,
      envName,
    );

    // MrRouter requires traceparent header. Add one if it doesn't exist.
    // ex: ST3 where Sentry is not available @see intercept.ts for more details
    if (!headers[TRACEPARENT_HEADER]) {
      const traceId = randomTraceId();
      const spanId = randomSpanId();
      const sampled = "01";
      // eslint-disable-next-line no-param-reassign
      headers[TRACEPARENT_HEADER] = `00-${traceId}-${spanId}-${sampled}`;
    }
  }
};

export {
  readme,
  getMrRouterConfig,
  getMrRouterEnvName,
  setMrRouterEnvName,
  mergeMrRouterTracestate,
  setMrRouterHeaders,
};
