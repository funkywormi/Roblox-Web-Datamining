import type { ReadonlySignal } from "@preact/signals-core";
import type { DescMessage } from "@bufbuild/protobuf";
import type { Url } from "@rbx/core-lib/url";
import { SduiPageContext } from "./analytics";
import { SduiComponentConfig } from "./binding";
import { HydrationContent } from "./hydration";
import { TemplateEntry } from "./store";

// ─── Page Entry Types ───

export interface PageEntry {
  robloxComponent: string;
  identifier: string;
  title?: string;
  category?: string;
}

export interface UniversalPageEntry {
  pageEntry: PageEntry;
  inputData: Record<string, unknown>;
  inputDataType: string;
}

export interface FeedEntry {
  inputData: Record<string, unknown>;
  robloxComponent: string;
}

// ─── API Response ───

export interface SduiApiResponse {
  pageEntries: UniversalPageEntry[];
  templates: Record<string, TemplateEntry>;
  hydrationData: HydrationContent;
  localizedLiterals?: Record<string, string>;
}

/**
 * Attach a surface-specific shape to {@link SduiApiResponse} so the API-level
 * extras that pass through `convertDecodedMessage` (pagination cursors,
 * totals, custom counters) are statically typed at the call site without
 * forcing every page to widen the shared response type.
 */
export type SduiApiResponseAs<TExtras extends Record<string, unknown> = Record<string, unknown>> =
  SduiApiResponse & TExtras;

// ─── API Store Types ───

export type SduiFetchReason = "initial" | "loadMore" | "refresh";

export type SduiInputDataMergeStrategy = "replace" | "merge" | "append";

export type SduiInputDataMergeStrategyResolver = (
  path: readonly string[],
  existingValue: unknown,
  incomingValue: unknown,
) => SduiInputDataMergeStrategy | undefined;

export type SduiTargetedRefreshParamValue =
  | string
  | number
  | boolean
  | null
  | readonly SduiTargetedRefreshParamValue[]
  | Readonly<{ [key: string]: SduiTargetedRefreshParamValue }>;

export interface SduiTargetedRefreshInput {
  /**
   * Logical component path. The first segment selects a top-level page entry;
   * each later segment selects an identifier within the preceding subtree.
   *
   * Nested lookup currently supports feed-item input data whose identity is
   * represented by a map key or an `identifier` field. Generic SDUI component
   * identity, including identity supplied by templates, requires a
   * template-aware resolution mechanism that is outside the current scope.
   */
  identifierPath: readonly string[];
  /** Feature-owned values used to build the focused request and its canonical identity. */
  requestParams?: Readonly<Record<string, SduiTargetedRefreshParamValue>>;
}

export type SduiTargetedRefreshTargetResult =
  | { status: "updated"; target: SduiTargetedRefreshInput }
  | { status: "invalid"; target: SduiTargetedRefreshInput; reason: string }
  | { status: "missing"; target: SduiTargetedRefreshInput };

export type SduiTargetedRefreshUnavailableReason =
  | "baseConfigMissing"
  | "cachedResponseMissing"
  | "targetedRefreshUrlMissing";

export type SduiTargetedRefreshResult =
  | {
      status: "completed";
      targetResults: readonly SduiTargetedRefreshTargetResult[];
      unexpectedPageEntryIdentifiers: readonly string[];
    }
  | {
      status: "unavailable";
      reason: SduiTargetedRefreshUnavailableReason;
      targets: readonly SduiTargetedRefreshInput[];
    }
  | {
      status: "failed";
      error: Error;
      targets: readonly SduiTargetedRefreshInput[];
    }
  | {
      status: "canceled";
      targets: readonly SduiTargetedRefreshInput[];
    };

export interface ApiRequestConfig {
  url: Url;
  surfaceKey: string;
  configKey?: string;
  responseFormat?: "protobuf" | "json";
  startSource?: SduiFetchReason;
  /**
   * Proto descriptor for decoding protobuf responses. Required when
   * `responseFormat` is `"protobuf"`. Optional when seeding from
   * a pre-decoded response (SSR hydration).
   */
  protoSchema?: DescMessage;
  isPaginated?: boolean;
  /**
   * Per-field strategy for continuation merges. Mirrors lua-apps'
   * `ApiRequestConfig.mergeStrategy`: records recurse and arrays append when
   * the resolver returns `undefined`.
   */
  mergeStrategy?: SduiInputDataMergeStrategyResolver;
  buildNextPageUrl?: (previousResponse: SduiApiResponse) => Url | undefined;
  buildRefreshUrl?: () => Url | undefined;
  buildTargetedRefreshUrl?: (inputs: readonly SduiTargetedRefreshInput[]) => Url | undefined;
  onRetry?: () => void;
  /**
   * When true, a successful fetch that produces zero parsed page entries
   * clears the cached configs for this `configKey`.
   */
  clearOnEmptyResponse?: boolean;
  /**
   * When true, suppresses the `NoComponentConfigsBuilt` error for a
   * successful non-paginated response that produced zero configs. For
   * surfaces where an empty response is a valid state (e.g. prompts).
   */
  allowNoConfigsBuilt?: boolean;
  headers?: Record<string, string>;
  pageContext: SduiPageContext;
  /**
   * Per-request timeout in milliseconds.
   *
   * @default DEFAULT_SDUI_REQUEST_TIMEOUT_MS (10s)
   */
  timeoutMs?: number;
  /** Caller-provided abort signal (route changes, unmount, etc.). */
  signal?: AbortSignal;
}

export const CacheStatus = {
  Idle: "idle",
  Loading: "loading",
  Loaded: "loaded",
  Error: "error",
} as const;

export type CacheStatus = (typeof CacheStatus)[keyof typeof CacheStatus];

export type LoadMoreStatus =
  | { status: Exclude<CacheStatus, typeof CacheStatus.Error> }
  | { status: typeof CacheStatus.Error; error: Error };

export interface CacheEntry {
  response?: SduiApiResponse;
  configs: Map<string, SduiComponentConfig>;
  status: CacheStatus;
  error?: Error;
  nextPageUrl?: Url;
  /** Pagination state tracked independently so load-more never replaces the loaded surface. */
  loadMoreStatus: LoadMoreStatus;
  /** Wall-clock ms (`Date.now()`) of the most recent successful fetch. */
  dataUpdatedTimestamp?: number;
}

/**
 * Implemented by `createSduiApiStore`. Declared here so consumers (including
 * `SduiActionContext`) can reference the store contract without importing the
 * implementation module.
 */
export interface SduiApiStore {
  fetchIfNeeded(requestConfig: ApiRequestConfig, forceRefresh?: boolean): Promise<void>;
  getData(configKey: string): CacheEntry | undefined;
  getRootConfig(configKey: string, identifier?: string): SduiComponentConfig | undefined;
  getTitle(configKey: string, identifier?: string): string | undefined;
  getStatus(configKey: string): CacheStatus;
  /** `Date.now()` of the most recent successful load for this `configKey`. */
  getDataUpdatedTimestamp(configKey: string): number | undefined;
  /** Pagination — derives a paginated requestConfig and routes through `fetchIfNeeded`. */
  loadMoreFromApi(configKey: string): Promise<void>;
  /**
   * Force a fresh non-paginated fetch for this `configKey`.
   */
  refreshFromApi(configKey: string): Promise<void>;
  /**
   * Web extends Lua's per-config serialization by replacing older targeted
   * refresh work only when the canonical target batch is identical.
   */
  refreshTargetFromApi(
    configKey: string,
    inputs: readonly SduiTargetedRefreshInput[],
  ): Promise<SduiTargetedRefreshResult>;
  isInFlight(configKey: string): boolean;
  getCacheSignal(configKey: string): ReadonlySignal<CacheEntry | undefined>;
  /**
   * Read-only handle to the config-scoped, per-identifier input-data signal.
   * Returns `undefined` for identifiers that have not yet been seeded by a
   * response (mirrors lua's `inputDataSignals.get(false)` returning nil).
   * Consumers that want a guaranteed record can `?? EMPTY` at the read
   * site.
   */
  getInputDataSignal(
    configKey: string,
    identifier: string,
  ): ReadonlySignal<Record<string, unknown> | undefined>;
  clear(configKey?: string): void;

  /**
   * Optimistically removes sub-entries whose `title` matches across all fetched
   * config keys, returning the keys it touched so the caller can refetch them (the UI updates
   * reactively via each key's cache signal). Scoped to entries with a backend
   * `category`.
   */
  dismissEntry(title: string): string[];

  /**
   * Populate the store from a pre-fetched API response without making a
   * network request.
   */
  seedFromResponse(response: SduiApiResponse, requestConfig: ApiRequestConfig): void;
}
