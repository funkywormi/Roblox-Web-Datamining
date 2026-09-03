import { batch, signal, type Signal } from "@preact/signals-core";
import type { Url } from "@rbx/core-lib/url";
import type {
  ApiRequestConfig,
  CacheEntry,
  SduiAnalyticsReporter,
  SduiApiResponse,
  SduiApiStore,
  SduiBuilder,
  SduiComponentConfig,
  SduiDataBinder,
  SduiErrorReporter,
  SduiFetchReason,
  SduiPageContext,
  SduiTargetedRefreshInput,
  SduiTargetedRefreshResult,
  SduiTargetedRefreshUnavailableReason,
  SduiTemplateStore,
} from "../types";
import { CacheStatus } from "../types";
import {
  handleSduiApiResponse,
  parseHydrationData,
  parseLocalizedLiterals,
  parsePageEntries,
  parseTemplateEntries,
} from "./responseParser";
import { reportError, SduiErrorName } from "../errors";
import type { SduiLoadTimerRegistry } from "../performance/SduiLoadTimerRegistry";
import type { SduiLoadTimer } from "../types/performance";
import { getConfigKey, pickRootConfig } from "../utils/apiStoreHelper";
import { toError } from "../utils/error";
import { mergePaginatedSduiResponse } from "./mergeSduiResponse";
import { createSduiRequestExecutor } from "./SduiRequestExecutor";
import { createSduiRequestQueue, type IsCurrentRequest } from "./SduiRequestQueue";
import {
  buildCompletedTargetedRefreshResult,
  buildTargetedRefreshPatches,
  mergeTargetedResponse,
  prepareTargetedRefreshInputs,
  resolveTargetedRefreshTargets,
  TargetedRefreshError,
  type InvalidTargetedRefreshTarget,
  type ResolvedTargetedRefreshTarget,
} from "./targetedRefresh";

// ─── Public Types ───

export interface SduiApiStoreDeps {
  templateStore: SduiTemplateStore;
  dataBinder: SduiDataBinder;
  builder: SduiBuilder;
  errorReporter: SduiErrorReporter;
  analyticsReporter: SduiAnalyticsReporter;
  loadTimerRegistry: SduiLoadTimerRegistry;
}

const EMPTY_CACHE_ENTRY: CacheEntry = {
  configs: new Map(),
  status: CacheStatus.Idle,
  loadMoreStatus: { status: CacheStatus.Idle },
};

/**
 * The `unavailable` reasons that mean the surface is wired wrong and can never
 * complete a targeted refresh, so they are worth reporting. `cachedResponseMissing`
 * is absent because refreshing before the initial page load lands is a race, not
 * a defect.
 */
const TARGETED_REFRESH_DEFECT_REASONS = {
  baseConfigMissing: "no base request config is cached for this surface",
  targetedRefreshUrlMissing: "the request config does not provide buildTargetedRefreshUrl",
} as const satisfies Partial<Record<SduiTargetedRefreshUnavailableReason, string>>;

const setLoading = (previous: CacheEntry): CacheEntry => ({
  ...previous,
  status: CacheStatus.Loading,
  loadMoreStatus: { status: CacheStatus.Idle },
});

const setError =
  (error: unknown) =>
  (previous: CacheEntry): CacheEntry => ({
    ...previous,
    status: CacheStatus.Error,
    error: toError(error),
  });

const setLoadingMore = (previous: CacheEntry): CacheEntry => ({
  ...previous,
  loadMoreStatus: { status: CacheStatus.Loading },
});

const clearLoadingMore = (previous: CacheEntry): CacheEntry => ({
  ...previous,
  loadMoreStatus: { status: CacheStatus.Loaded },
});

const setLoadMoreError =
  (error: unknown) =>
  (previous: CacheEntry): CacheEntry => ({
    ...previous,
    loadMoreStatus: { status: CacheStatus.Error, error: toError(error) },
  });

type StoredRequestConfig = Omit<ApiRequestConfig, "signal" | "isPaginated" | "startSource">;

type SduiFetchOutcome<TResult> =
  | { status: "applied"; result: TResult }
  | { status: "failed"; error: Error }
  | { status: "canceled" };

type CacheStatePolicy = "update" | "preserve" | "paginate";

function unavailableTargetedRefresh(
  reason: Extract<SduiTargetedRefreshResult, { status: "unavailable" }>["reason"],
  targets: readonly SduiTargetedRefreshInput[],
): SduiTargetedRefreshResult {
  return { status: "unavailable", reason, targets };
}

function toStoredRequestConfig(requestConfig: ApiRequestConfig): StoredRequestConfig {
  const storedConfig = { ...requestConfig };
  delete storedConfig.signal;
  delete storedConfig.isPaginated;
  delete storedConfig.startSource;
  return storedConfig;
}

// ─── Factory ───

export function createSduiApiStore(deps: SduiApiStoreDeps): SduiApiStore {
  // ─── Internal state ───

  // Per-surface cache entry (resolved config objects, response, status, nextPageUrl), keyed by
  // page identifier.
  const cacheSignals = new Map<string, Signal<CacheEntry | undefined>>();
  const inputDataSignals = new Map<
    string,
    Map<string, Signal<Record<string, unknown> | undefined>>
  >();
  const requestQueue = createSduiRequestQueue();
  // Stores only the *base* (non-paginated) request config per key. Paginated
  // and refresh fetches derive their URL/flags from this and never overwrite it.
  const baseRequestConfigs = new Map<string, StoredRequestConfig>();
  const { analyticsReporter, loadTimerRegistry } = deps;
  const executeSduiRequest = createSduiRequestExecutor({
    analyticsReporter,
    errorReporter: deps.errorReporter,
  });

  function resetLoadTimer(requestConfig: ApiRequestConfig): SduiLoadTimer {
    return loadTimerRegistry.reset(getConfigKey(requestConfig), {
      pageContext: requestConfig.pageContext,
    });
  }

  function resolveLoadTimer(requestConfig: ApiRequestConfig): SduiLoadTimer | undefined {
    return loadTimerRegistry.get(getConfigKey(requestConfig));
  }

  // ─── Signal accessors ───

  function getOrCreateCacheSignal(configKey: string): Signal<CacheEntry | undefined> {
    let cacheSignal = cacheSignals.get(configKey);
    if (!cacheSignal) {
      cacheSignal = signal<CacheEntry | undefined>(undefined);
      cacheSignals.set(configKey, cacheSignal);
    }
    return cacheSignal;
  }

  /**
   * Single point of access for config-scoped input-data signals. Lazily
   * creates the config map and identifier signal.
   */
  function getOrCreateInputDataSignal(
    configKey: string,
    identifier: string,
  ): Signal<Record<string, unknown> | undefined> {
    let configInputDataSignals = inputDataSignals.get(configKey);
    if (!configInputDataSignals) {
      configInputDataSignals = new Map();
      inputDataSignals.set(configKey, configInputDataSignals);
    }

    let inputDataSignal = configInputDataSignals.get(identifier);
    if (!inputDataSignal) {
      inputDataSignal = signal<Record<string, unknown> | undefined>(undefined);
      configInputDataSignals.set(identifier, inputDataSignal);
    }
    return inputDataSignal;
  }

  // ─── Cache mutators ───

  function updateCache(configKey: string, updater: (previous: CacheEntry) => CacheEntry): void {
    const cacheSignal = getOrCreateCacheSignal(configKey);
    cacheSignal.value = updater(cacheSignal.peek() ?? EMPTY_CACHE_ENTRY);
  }

  // ─── Response application ───

  function applyResponse(response: SduiApiResponse, requestConfig: ApiRequestConfig): void {
    const configKey = getConfigKey(requestConfig);
    const paginateResponse = requestConfig.isPaginated === true;
    const loadTimer = resolveLoadTimer(requestConfig);

    batch(() => {
      const newlyBuiltEntries = handleSduiApiResponse(response, {
        templateStore: deps.templateStore,
        dataBinder: deps.dataBinder,
        builder: deps.builder,
        configKey,
        scope: requestConfig.surfaceKey,
        pageContext: requestConfig.pageContext,
        errorReporter: deps.errorReporter,
        paginateResponse,
        mergeStrategy: requestConfig.mergeStrategy,
        getInputDataSignal: identifier => getOrCreateInputDataSignal(configKey, identifier),
        hasComponentConfig: identifier =>
          getOrCreateCacheSignal(configKey).peek()?.configs.has(identifier) === true,
        parseHydrationData,
        parseTemplateEntries,
        parsePageEntries,
        ...(loadTimer ? { loadTimer } : {}),
      });

      if (
        !paginateResponse &&
        newlyBuiltEntries.length === 0 &&
        requestConfig.allowNoConfigsBuilt !== true
      ) {
        reportError(
          SduiErrorName.NoComponentConfigsBuilt,
          `No configs built when handling response for ${configKey}`,
          requestConfig.pageContext,
          { name: configKey },
          deps.errorReporter,
        );
      }

      const isEmpty = response.pageEntries.length === 0;
      const shouldClear =
        !paginateResponse && isEmpty && requestConfig.clearOnEmptyResponse === true;

      updateCache(configKey, previous => {
        let cachedResponse = response;
        if (paginateResponse) {
          cachedResponse = mergePaginatedSduiResponse(
            previous.response,
            response,
            requestConfig.mergeStrategy,
          );
        } else if (!shouldClear && isEmpty && previous.response) {
          cachedResponse = previous.response;
        }
        const nextPageUrl = requestConfig.buildNextPageUrl?.(cachedResponse);
        // Fast path: paginated response that produced no new builds.
        if (paginateResponse && newlyBuiltEntries.length === 0) {
          return {
            ...previous,
            response: cachedResponse,
            status: "loaded",
            error: undefined,
            nextPageUrl,
            dataUpdatedTimestamp: Date.now(),
          };
        }

        const shouldPreserveEntries = paginateResponse || (!shouldClear && isEmpty);
        const configs = shouldPreserveEntries
          ? new Map(previous.configs)
          : new Map<string, SduiComponentConfig>();
        for (const entry of newlyBuiltEntries) {
          configs.set(entry.identifier, entry.config);
        }
        return {
          ...previous,
          response: cachedResponse,
          configs,
          status: "loaded",
          error: undefined,
          nextPageUrl,
          dataUpdatedTimestamp: Date.now(),
        };
      });
    });
  }

  function reportTargetedRefreshDiagnostics(
    configKey: string,
    requestConfig: ApiRequestConfig,
    {
      invalidTargets = [],
      missingTargets = [],
      unexpectedPageEntryIdentifiers = [],
    }: {
      invalidTargets?: readonly InvalidTargetedRefreshTarget[];
      missingTargets?: readonly SduiTargetedRefreshInput[];
      unexpectedPageEntryIdentifiers?: readonly string[];
    },
  ): void {
    const report = (name: SduiErrorName, message: string, bindingPath: string) => {
      reportError(
        name,
        message,
        requestConfig.pageContext,
        { name: configKey, bindingPath },
        deps.errorReporter,
      );
    };
    for (const { target, reason } of invalidTargets) {
      report(SduiErrorName.TargetedRefreshInvalidTarget, reason, target.identifierPath.join(" > "));
    }
    for (const target of missingTargets) {
      const bindingPath = target.identifierPath.join(" > ");
      report(
        SduiErrorName.TargetedRefreshMissingTarget,
        `Targeted refresh response does not contain target "${bindingPath}"`,
        bindingPath,
      );
    }
    for (const identifier of unexpectedPageEntryIdentifiers) {
      report(
        SduiErrorName.TargetedRefreshUnexpectedPageEntry,
        `Targeted refresh response contains unrequested page entry "${identifier}"`,
        identifier,
      );
    }
  }

  function reportUnavailableTargetedRefresh(
    configKey: string,
    reason: keyof typeof TARGETED_REFRESH_DEFECT_REASONS,
    targets: readonly SduiTargetedRefreshInput[],
    pageContext?: SduiPageContext,
  ): SduiTargetedRefreshResult {
    reportError(
      SduiErrorName.TargetedRefreshUnavailable,
      `Targeted refresh unavailable: ${TARGETED_REFRESH_DEFECT_REASONS[reason]}`,
      pageContext,
      {
        name: configKey,
        bindingPath: targets.map(({ identifierPath }) => identifierPath.join(" > ")).join(", "),
      },
      deps.errorReporter,
    );
    return unavailableTargetedRefresh(reason, targets);
  }

  function applyTargetedResponse(
    response: SduiApiResponse,
    requestConfig: ApiRequestConfig,
    targets: readonly SduiTargetedRefreshInput[],
    validatedTargets: readonly ResolvedTargetedRefreshTarget[],
    initialInvalidTargets: readonly InvalidTargetedRefreshTarget[],
  ): SduiTargetedRefreshResult {
    const configKey = getConfigKey(requestConfig);
    const currentCachedResponse = getOrCreateCacheSignal(configKey).peek()?.response;
    if (!currentCachedResponse) {
      return unavailableTargetedRefresh("cachedResponseMissing", targets);
    }

    const currentTargetResolution = resolveTargetedRefreshTargets(
      currentCachedResponse,
      validatedTargets.map(({ target }) => target),
      identifier => getOrCreateInputDataSignal(configKey, identifier).peek(),
      validatedTargets,
    );
    reportTargetedRefreshDiagnostics(configKey, requestConfig, {
      invalidTargets: currentTargetResolution.invalidTargets,
    });
    const invalidTargets = [...initialInvalidTargets, ...currentTargetResolution.invalidTargets];
    if (currentTargetResolution.validTargets.length === 0) {
      return buildCompletedTargetedRefreshResult(targets, invalidTargets);
    }

    const validTargets = currentTargetResolution.validTargets.map(({ target }) => target);
    const result = buildTargetedRefreshPatches(
      response,
      currentTargetResolution.pageEntries,
      validTargets,
    );
    reportTargetedRefreshDiagnostics(configKey, requestConfig, result);

    const mergedResponse = mergeTargetedResponse(
      currentCachedResponse,
      response,
      result.patchedInputData,
    );
    const patchedIdentifiers = new Set(result.patchedInputData.keys());
    // Rebuild only when the root RCT changes; otherwise the existing config reacts to its
    // updated input-data signal.
    const changedRootEntries = mergedResponse.pageEntries.filter(entry => {
      const { identifier } = entry.pageEntry;
      return (
        patchedIdentifiers.has(identifier) &&
        currentTargetResolution.pageEntries.get(identifier)?.pageEntry.robloxComponent !==
          entry.pageEntry.robloxComponent
      );
    });
    const loadTimer = resolveLoadTimer(requestConfig);

    batch(() => {
      const templateSnapshot = deps.templateStore.snapshot();
      const previousInputData = new Map<string, Record<string, unknown> | undefined>();
      let rebuiltEntries: ReturnType<typeof parsePageEntries> = [];

      try {
        parseTemplateEntries(response.templates, deps.templateStore);
        for (const [identifier, inputData] of result.patchedInputData) {
          const inputDataSignal = getOrCreateInputDataSignal(configKey, identifier);
          previousInputData.set(identifier, inputDataSignal.peek());
          inputDataSignal.value = inputData;
        }

        loadTimer?.logConfigBuildBegin();
        try {
          rebuiltEntries = parsePageEntries(changedRootEntries, {
            templateStore: deps.templateStore,
            builder: deps.builder,
            configKey,
            scope: requestConfig.surfaceKey,
            pageContext: requestConfig.pageContext,
            errorReporter: deps.errorReporter,
            paginateResponse: false,
            getInputDataSignal: identifier => getOrCreateInputDataSignal(configKey, identifier),
          });
        } finally {
          loadTimer?.logConfigBuildEnd();
        }

        if (rebuiltEntries.length !== changedRootEntries.length) {
          throw new TargetedRefreshError(
            "Targeted refresh failed to rebuild a changed root component",
          );
        }
      } catch (error) {
        for (const [identifier, inputData] of previousInputData) {
          getOrCreateInputDataSignal(configKey, identifier).value = inputData;
        }
        deps.templateStore.restore(templateSnapshot);
        throw error;
      }

      loadTimer?.logResponseDataStoreUpdateBegin();
      parseHydrationData(response.hydrationData, deps.dataBinder);
      parseLocalizedLiterals(response.localizedLiterals, deps.dataBinder);
      loadTimer?.logResponseDataStoreUpdateEnd();

      updateCache(configKey, previous => {
        const configs = new Map(previous.configs);
        for (const entry of rebuiltEntries) {
          configs.set(entry.identifier, entry.config);
        }
        return {
          ...previous,
          response: mergedResponse,
          configs,
          status: "loaded",
          error: undefined,
          nextPageUrl: requestConfig.buildNextPageUrl?.(mergedResponse),
          dataUpdatedTimestamp:
            patchedIdentifiers.size > 0 ? Date.now() : previous.dataUpdatedTimestamp,
        };
      });
    });

    return buildCompletedTargetedRefreshResult(
      targets,
      invalidTargets,
      result.missingTargets,
      result.unexpectedPageEntryIdentifiers,
    );
  }

  async function runFetch<TResult>(
    requestConfig: ApiRequestConfig,
    url: Url,
    isRequestCurrent: IsCurrentRequest,
    invalidationSignal: AbortSignal,
    applyDecodedResponse: (response: SduiApiResponse, requestConfig: ApiRequestConfig) => TResult,
    cacheStatePolicy: CacheStatePolicy = "update",
  ): Promise<SduiFetchOutcome<TResult>> {
    const configKey = getConfigKey(requestConfig);
    const startSource: SduiFetchReason = requestConfig.startSource ?? "initial";
    const loadTimer = resetLoadTimer(requestConfig);

    loadTimer.start(startSource);
    loadTimer.logUiRequestQueued();
    if (cacheStatePolicy === "update") {
      updateCache(configKey, setLoading);
    } else if (cacheStatePolicy === "paginate") {
      updateCache(configKey, setLoadingMore);
    }

    try {
      const decodedResponse = await executeSduiRequest(requestConfig, url, {
        loadTimer,
        isRequestCurrent,
        reportPageAnalytics: true,
        invalidationSignal,
      });
      if (!isRequestCurrent()) {
        return { status: "canceled" };
      }
      const result = applyDecodedResponse(decodedResponse, requestConfig);
      if (cacheStatePolicy === "paginate") {
        updateCache(configKey, clearLoadingMore);
      }
      if (startSource === "initial") {
        loadTimer.finish();
      } else {
        loadTimer.logRefreshComplete();
      }
      return { status: "applied", result };
    } catch (error) {
      if (!isRequestCurrent()) {
        return { status: "canceled" };
      }
      loadTimer.updateRequestStatus("FailedToLoad");
      loadTimer.finish();
      if (cacheStatePolicy === "update") {
        updateCache(configKey, setError(error));
      } else if (cacheStatePolicy === "paginate") {
        updateCache(configKey, setLoadMoreError(error));
      }
      return { status: "failed", error: toError(error) };
    }
  }

  // ─── Public API ───

  return {
    async fetchIfNeeded(requestConfig, forceRefresh = false) {
      const configKey = getConfigKey(requestConfig);
      const requestHref = requestConfig.url.href;

      await requestQueue.enqueue(
        configKey,
        async (isRequestCurrent, invalidationSignal) => {
          // Cache validation belongs inside the queue so no later operation can
          // append between the check and this request. The cached URL is read
          // here for the same reason: an earlier queued fetch may have replaced
          // it, and a caller whose URL differs — a filter applied mid-fetch —
          // must issue its own request rather than accept the previous URL's data.
          const isSameUrlAsCached = baseRequestConfigs.get(configKey)?.url.href === requestHref;
          if (!forceRefresh && isSameUrlAsCached && this.getData(configKey)?.status === "loaded") {
            return;
          }

          // Persist only accepted base requests. Invocation-scoped fields are
          // stripped so an old caller cannot poison later refresh/pagination.
          if (
            !requestConfig.isPaginated &&
            (requestConfig.startSource ?? "initial") === "initial"
          ) {
            baseRequestConfigs.set(configKey, toStoredRequestConfig(requestConfig));
          }

          await runFetch(
            requestConfig,
            requestConfig.url,
            isRequestCurrent,
            invalidationSignal,
            applyResponse,
          );
        },
        { signal: requestConfig.signal },
      );
    },

    getData(configKey) {
      return getOrCreateCacheSignal(configKey).peek();
    },

    getRootConfig(configKey, identifier) {
      return pickRootConfig(this.getData(configKey), identifier);
    },

    getTitle(configKey, identifier) {
      const entry = this.getData(configKey);
      if (!entry?.response) return undefined;

      const titlesByIdentifier = new Map<string, string>();
      for (const { pageEntry } of entry.response.pageEntries) {
        if (entry.configs.has(pageEntry.identifier) && pageEntry.title) {
          titlesByIdentifier.set(pageEntry.identifier, pageEntry.title);
        }
      }

      if (identifier) return titlesByIdentifier.get(identifier);
      return titlesByIdentifier.values().next().value;
    },

    getStatus(configKey) {
      return this.getData(configKey)?.status ?? "idle";
    },

    getDataUpdatedTimestamp(configKey) {
      return this.getData(configKey)?.dataUpdatedTimestamp;
    },

    async loadMoreFromApi(configKey) {
      await requestQueue.enqueue(
        configKey,
        async (isRequestCurrent, invalidationSignal) => {
          const baseConfig = baseRequestConfigs.get(configKey);
          const entry = this.getData(configKey);
          if (!baseConfig || !entry?.nextPageUrl) return;

          const nextUrl =
            baseConfig.buildNextPageUrl && entry.response
              ? baseConfig.buildNextPageUrl(entry.response)
              : entry.nextPageUrl;
          if (!nextUrl) return;

          await runFetch(
            {
              ...baseConfig,
              url: nextUrl,
              isPaginated: true,
              startSource: "loadMore",
            },
            nextUrl,
            isRequestCurrent,
            invalidationSignal,
            applyResponse,
            "paginate",
          );
        },
        { dedupeKey: "pagination" },
      );
    },

    async refreshFromApi(configKey) {
      if (!baseRequestConfigs.has(configKey)) return;

      await requestQueue.enqueue(
        configKey,
        async (isRequestCurrent, invalidationSignal) => {
          const baseConfig = baseRequestConfigs.get(configKey);
          if (!baseConfig) return;
          const refreshUrl = baseConfig.buildRefreshUrl?.() ?? baseConfig.url;
          await runFetch(
            {
              ...baseConfig,
              url: refreshUrl,
              isPaginated: false,
              startSource: "refresh",
            },
            refreshUrl,
            isRequestCurrent,
            invalidationSignal,
            applyResponse,
          );
        },
        { dedupeKey: "refresh" },
      );
    },

    async refreshTargetFromApi(configKey, inputs) {
      const { inputs: targets, requestIdentity } = prepareTargetedRefreshInputs(inputs);
      let refreshResult: SduiTargetedRefreshResult = {
        status: "canceled",
        targets,
      };

      try {
        await requestQueue.enqueue(
          configKey,
          async (isRequestCurrent, invalidationSignal) => {
            const baseConfig = baseRequestConfigs.get(configKey);
            if (!baseConfig) {
              refreshResult = reportUnavailableTargetedRefresh(
                configKey,
                "baseConfigMissing",
                targets,
              );
              return;
            }

            const cachedResponse = getOrCreateCacheSignal(configKey).peek()?.response;
            if (!cachedResponse) {
              refreshResult = unavailableTargetedRefresh("cachedResponseMissing", targets);
              return;
            }

            // Capture current target values for the post-request consistency check.
            const initialTargetResolution = resolveTargetedRefreshTargets(
              cachedResponse,
              targets,
              identifier => getOrCreateInputDataSignal(configKey, identifier).peek(),
            );
            reportTargetedRefreshDiagnostics(configKey, baseConfig, {
              invalidTargets: initialTargetResolution.invalidTargets,
            });
            if (initialTargetResolution.validTargets.length === 0) {
              refreshResult = buildCompletedTargetedRefreshResult(
                targets,
                initialTargetResolution.invalidTargets,
              );
              return;
            }

            const validTargets = initialTargetResolution.validTargets.map(({ target }) => target);
            const targetedRefreshUrl = baseConfig.buildTargetedRefreshUrl?.(validTargets);
            if (!targetedRefreshUrl) {
              refreshResult = reportUnavailableTargetedRefresh(
                configKey,
                "targetedRefreshUrlMissing",
                targets,
                baseConfig.pageContext,
              );
              return;
            }

            const requestConfig: ApiRequestConfig = {
              ...baseConfig,
              url: targetedRefreshUrl,
              isPaginated: false,
              startSource: "refresh",
            };
            const fetchOutcome = await runFetch(
              requestConfig,
              targetedRefreshUrl,
              isRequestCurrent,
              invalidationSignal,
              (response, config) =>
                applyTargetedResponse(
                  response,
                  config,
                  targets,
                  initialTargetResolution.validTargets,
                  initialTargetResolution.invalidTargets,
                ),
              "preserve",
            );

            if (fetchOutcome.status === "failed") {
              refreshResult = {
                status: "failed",
                error: fetchOutcome.error,
                targets,
              };
            } else if (fetchOutcome.status === "canceled") {
              refreshResult = { status: "canceled", targets };
            } else {
              refreshResult = fetchOutcome.result;
            }
          },
          { replacementKey: requestIdentity },
        );
      } catch (error) {
        refreshResult = {
          status: "failed",
          error: toError(error),
          targets,
        };
      }
      return refreshResult;
    },

    isInFlight(configKey) {
      return requestQueue.isInFlight(configKey);
    },

    getCacheSignal(configKey) {
      return getOrCreateCacheSignal(configKey);
    },

    getInputDataSignal(configKey, identifier) {
      return getOrCreateInputDataSignal(configKey, identifier);
    },

    seedFromResponse(response, requestConfig) {
      const configKey = getConfigKey(requestConfig);
      requestQueue.invalidate(configKey);
      baseRequestConfigs.set(configKey, toStoredRequestConfig(requestConfig));
      // No network request runs for seeded data, so start a timer here.
      const loadTimer = resetLoadTimer(requestConfig);
      loadTimer.start("seed");
      // SSR seed is non-paginated for now; force the flag off and don't rely on derived configs.
      applyResponse(response, { ...requestConfig, isPaginated: false });
      loadTimer.finish();
    },

    clear(configKey) {
      if (configKey) {
        const cacheSignal = cacheSignals.get(configKey);
        batch(() => {
          requestQueue.invalidate(configKey);
          inputDataSignals.delete(configKey);
          if (cacheSignal) cacheSignal.value = undefined;
          baseRequestConfigs.delete(configKey);
          loadTimerRegistry.clear(configKey);
        });
        return;
      }
      batch(() => {
        for (const cacheSignal of cacheSignals.values()) {
          cacheSignal.value = undefined;
        }
        inputDataSignals.clear();
        baseRequestConfigs.clear();
        requestQueue.invalidate();
        loadTimerRegistry.clear();
      });
    },

    dismissEntry(title) {
      const affectedConfigKeys: string[] = [];
      if (!title) return affectedConfigKeys;

      batch(() => {
        for (const [configKey, cacheSignal] of cacheSignals) {
          const entry = cacheSignal.peek();
          const pageEntries = entry?.response?.pageEntries;
          if (!entry?.response || !pageEntries) continue;

          const dismissed = new Set(
            pageEntries
              .filter(({ pageEntry }) => pageEntry.category && pageEntry.title === title)
              .map(({ pageEntry }) => pageEntry.identifier),
          );
          if (dismissed.size === 0) continue;

          const configs = new Map(entry.configs);
          for (const identifier of dismissed) {
            configs.delete(identifier);
          }

          cacheSignal.value = {
            ...entry,
            configs,
            response: {
              ...entry.response,
              pageEntries: pageEntries.filter(
                ({ pageEntry }) => !dismissed.has(pageEntry.identifier),
              ),
            },
          };
          affectedConfigKeys.push(configKey);
        }
      });

      return affectedConfigKeys;
    },
  };
}
