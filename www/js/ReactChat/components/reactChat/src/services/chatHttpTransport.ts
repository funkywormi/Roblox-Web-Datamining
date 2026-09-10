import { httpService } from "@rbx/core-scripts/legacy/core-utilities";
import chatHttpTransportNextJs from "./chatHttpTransport.nextjs";

/**
 * Transport seam for reactChat's HTTP calls (SKILL Phase 4).
 *
 * All 5 chat services (chat, friends, presence, profileInsights, locale) route their network calls
 * through this factory-selected transport rather than importing `httpService` directly. This keeps
 * the .NET (Axios) path working while making the Next.js (core-lib fetch) path a single-file swap.
 *
 * The service boundary was already normalized to `Promise<T>` in Phase-4 Step 1, so `get`/`post`
 * here return the already-unwrapped body (T) — callers never touch the Axios `.data` envelope.
 */
export type TChatUrlConfig = {
  url: string;
  withCredentials?: boolean;
  retryable?: boolean;
  /** Send no-cache request headers so the response isn't served from an HTTP cache. */
  noCache?: boolean;
};

export type TChatHttpTransport = {
  get: <T>(config: TChatUrlConfig, params?: object) => Promise<T>;
  post: <T>(config: TChatUrlConfig, data?: object) => Promise<T>;
};

// Legacy Axios transport: delegate to `httpService` and unwrap `.data` here so the services are
// backend-agnostic. `retryable`/`withCredentials` pass straight through on the UrlConfig.
const legacy: TChatHttpTransport = {
  get: <T>(config: TChatUrlConfig, params?: object): Promise<T> =>
    httpService.get<T>(config, params).then(response => response.data),
  post: <T>(config: TChatUrlConfig, data?: object): Promise<T> =>
    httpService.post<T>(config, data).then(response => response.data),
};

// Factory: NEXT_PUBLIC_IS_NEXTJS is inlined at build time by Next.js. In the Rspack SCS build for
// .NET it is undefined, so the Axios transport is used. The nextjs sibling is statically imported so
// the .NET webpack build resolves it — it never *executes* on the .NET path (see the recommendations
// transport in avatar for the same pattern and the follow-up next.config alias needed at mount time).
const isNextJs = process.env.NEXT_PUBLIC_IS_NEXTJS === "true";

export default isNextJs ? chatHttpTransportNextJs : legacy;
