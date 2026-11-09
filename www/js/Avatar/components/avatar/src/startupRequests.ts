import AvatarAPIService, { type GetFeatureAccessResponse } from "./services/avatarAPIService";
import type { PlayerAvatarConfig } from "./avatarRules";
import type { AvatarConfigV2 } from "./avatarRequest";
import type { CatalogSettings } from "./catalogMetadataRequest";

// What the editor waits on before it can render.
type StartupRequests = {
  rules: Promise<PlayerAvatarConfig>;
  avatar: Promise<AvatarConfigV2>;
  catalogMetadata: Promise<CatalogSettings>;
  categories: Promise<unknown>;
  subcategories: Promise<unknown>;
  featureAccess: Promise<GetFeatureAccessResponse>;
};

type StartupRequestName = keyof StartupRequests;

const requests: { [K in StartupRequestName]: () => StartupRequests[K] } = {
  rules: () => AvatarAPIService.getAvatarRules(),
  avatar: () => AvatarAPIService.getAvatarV2(false),
  catalogMetadata: () => AvatarAPIService.getCatalogMetaData(false),
  categories: () => AvatarAPIService.getCategories(),
  subcategories: () => AvatarAPIService.getSubcategories(),
  featureAccess: () => AvatarAPIService.getFeatureAccess(),
};

// An unused prefetch older than this is dropped, so a later visit doesn't show stale data.
const MAX_PREFETCH_AGE_MS = 10_000;

let prefetched: Partial<StartupRequests> = {};
let prefetchedAt = 0;
// Once the editor has started fetching, a late prefetch would only duplicate its requests.
let editorStarted = false;

// Avoids an unhandled rejection before the editor takes the request.
const quiet = <T>(request: Promise<T>): Promise<T> => {
  request.catch(() => undefined);
  return request;
};

/** Starts the startup requests early. Next.js calls this while the editor chunk downloads; .NET doesn't. */
export const prefetchAvatarStartupRequests = (): void => {
  if (editorStarted) {
    return;
  }
  prefetchedAt = performance.now();
  prefetched = {
    rules: quiet(requests.rules()),
    avatar: quiet(requests.avatar()),
    catalogMetadata: quiet(requests.catalogMetadata()),
    categories: quiet(requests.categories()),
    subcategories: quiet(requests.subcategories()),
    featureAccess: quiet(requests.featureAccess()),
  };
};

export const hasPrefetchedStartupRequest = (name: StartupRequestName): boolean =>
  prefetched[name] !== undefined && performance.now() - prefetchedAt <= MAX_PREFETCH_AGE_MS;

/** Returns the prefetched request once, else starts a fresh one. */
export const takeStartupRequest = <K extends StartupRequestName>(name: K): StartupRequests[K] => {
  editorStarted = true;
  const request = hasPrefetchedStartupRequest(name) ? prefetched[name] : undefined;
  prefetched = { ...prefetched, [name]: undefined };
  return request ?? requests[name]();
};
