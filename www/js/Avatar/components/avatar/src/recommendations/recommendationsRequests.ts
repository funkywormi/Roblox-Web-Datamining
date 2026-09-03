import * as http from "@rbx/core-scripts/http";
import recommendationsRequestsNextJs from "./recommendationsRequests.nextjs";

/**
 * Transport seam for RecommendationsService's HTTP calls.
 *
 * RecommendationsService is ~90% pure logic (URL builders, item translators) with only a few
 * network calls, so we isolate just the HTTP behind this factory-selected transport rather than
 * duplicating the whole class into a `.nextjs` sibling. Only this file (the Axios transport) is
 * throwaway once the .NET path is removed; the pure logic stays single-source.
 *
 * `get<T>` returns the unwrapped value (T), not an Axios response — callers never touch `.data`.
 */
export type RecsUrlConfig = { url: string; withCredentials?: boolean };

export type RecommendationsTransport = {
  get: <T>(urlConfig: RecsUrlConfig, params?: object) => Promise<T>;
};

// Legacy Axios transport: unwrap `.data` here so the service is backend-agnostic.
const legacy: RecommendationsTransport = {
  get: <T>(urlConfig: RecsUrlConfig, params?: object): Promise<T> =>
    http.get<T>(urlConfig, params).then((r: { data: T }) => r.data),
};

// Factory: NEXT_PUBLIC_IS_NEXTJS is inlined at build time by Next.js. In the Rspack SCS build
// for .NET it is undefined, so the Axios transport is used. See avatarAPIService.ts for the
// same pattern and the www-common interceptor wiring that makes core-lib/http work in Next.js.
const isNextJs = process.env.NEXT_PUBLIC_IS_NEXTJS === "true";

export default isNextJs ? recommendationsRequestsNextJs : legacy;
