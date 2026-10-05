import type { Signal } from "@preact/signals-core";
import { reportError, SduiErrorName } from "../errors";
import { LOCALIZED_LITERALS_CONTENT_TYPE } from "../binding/stores";
import type {
  HydrationContent,
  SduiApiResponse,
  SduiBuilder,
  SduiComponentConfig,
  SduiDataBinder,
  SduiErrorReporter,
  SduiInputDataMergeStrategyResolver,
  SduiPageContext,
  SduiTemplateStore,
  UniversalPageEntry,
} from "../types";
import type { SduiLoadTimer } from "../types/performance";
import { mergeInputData } from "../utils/apiStoreHelper";

// ─── Public Types ───

export interface ParsedPageEntryConfig {
  config: SduiComponentConfig;
  identifier: string;
}

export type InputDataSignal = Signal<Record<string, unknown> | undefined>;

/**
 * Signature for the hydration-data parser. Walks the decoded response's
 * hydration payload and pushes it into the shared data-binder stores.
 */
export type ParseHydrationDataFn = (
  hydrationData: HydrationContent,
  dataBinder: SduiDataBinder,
) => void;

/**
 * Signature for the template-entries parser. Walks the decoded response's
 * templates section and pushes each entry into the shared template store.
 */
export type ParseTemplateEntriesFn = (
  templates: SduiApiResponse["templates"],
  templateStore: SduiTemplateStore,
) => void;

/**
 * Signature for the page-entries parser. Walks the decoded response's
 * page entries and returns the list of *newly built* configs. Merge-only
 * entries (paginated responses for already-seen identifiers) are absent
 * from the return value because they mutate their input-data signals in
 * place — the store layer doesn't re-add them.
 */
export type ParsePageEntriesFn = (
  pageEntries: UniversalPageEntry[],
  options: ParsePageEntriesOptions,
) => ParsedPageEntryConfig[];

export interface HandleResponseOptions {
  templateStore: SduiTemplateStore;
  dataBinder: SduiDataBinder;
  builder: SduiBuilder;
  configKey: string;
  scope: string;
  pageContext?: SduiPageContext;
  errorReporter?: SduiErrorReporter;
  paginateResponse: boolean;
  mergeStrategy?: SduiInputDataMergeStrategyResolver;
  /**
   * Lazily-creating accessor for the store-owned input-data signal.
   */
  getInputDataSignal: (identifier: string) => InputDataSignal;
  /**
   * Reports whether this config key currently owns a built config for an
   * identifier. Paginated entries only merge in place while that config exists.
   */
  hasComponentConfig?: (identifier: string) => boolean;

  // ─── Section parsers ───
  parseHydrationData: ParseHydrationDataFn;
  parseTemplateEntries: ParseTemplateEntriesFn;
  parsePageEntries: ParsePageEntriesFn;
  loadTimer?: SduiLoadTimer;
}

export interface ApplyResponseDataStoresOptions {
  templateStore: SduiTemplateStore;
  dataBinder: SduiDataBinder;
  parseHydrationData: ParseHydrationDataFn;
  parseTemplateEntries: ParseTemplateEntriesFn;
  loadTimer?: SduiLoadTimer;
}

export interface ParsePageEntriesOptions {
  templateStore: SduiTemplateStore;
  builder: SduiBuilder;
  configKey: string;
  scope: string;
  pageContext?: SduiPageContext;
  errorReporter?: SduiErrorReporter;
  paginateResponse: boolean;
  mergeStrategy?: SduiInputDataMergeStrategyResolver;
  getInputDataSignal: (identifier: string) => InputDataSignal;
  hasComponentConfig?: (identifier: string) => boolean;
}

// ─── Per-Section Parsers ───

export function parseHydrationData(
  hydrationData: HydrationContent,
  dataBinder: SduiDataBinder,
): void {
  dataBinder.updateDataStores(hydrationData);
}

export function parseTemplateEntries(
  templates: SduiApiResponse["templates"],
  templateStore: SduiTemplateStore,
): void {
  templateStore.addTemplates(templates);
}

/**
 * Pushes the response's `localized_literals` map into the localized-literals
 * store. Additive — paginated responses merge new keys without removing
 * existing ones (`LocalizedLiteralsStore` handles the additivity). No-op when
 * the map is absent.
 */
export function parseLocalizedLiterals(
  localizedLiterals: Record<string, string> | undefined,
  dataBinder: SduiDataBinder,
): void {
  if (!localizedLiterals) return;
  const store = dataBinder.getStore(LOCALIZED_LITERALS_CONTENT_TYPE);
  if (!store) return;
  store.applyUpdate(localizedLiterals);
}

/**
 * Applies response-scoped data that can be consumed independently of root
 * component configuration builds.
 */
export function applyResponseDataStores(
  response: SduiApiResponse,
  options: ApplyResponseDataStoresOptions,
): void {
  options.loadTimer?.logResponseDataStoreUpdateBegin();
  options.parseHydrationData(response.hydrationData, options.dataBinder);
  options.parseTemplateEntries(response.templates, options.templateStore);
  parseLocalizedLiterals(response.localizedLiterals, options.dataBinder);
  options.loadTimer?.logResponseDataStoreUpdateEnd();
}

export function parsePageEntries(
  pageEntries: UniversalPageEntry[],
  options: ParsePageEntriesOptions,
): ParsedPageEntryConfig[] {
  const {
    templateStore,
    builder,
    configKey,
    scope,
    pageContext,
    errorReporter,
    paginateResponse,
    mergeStrategy,
    getInputDataSignal,
    hasComponentConfig,
  } = options;
  const results: ParsedPageEntryConfig[] = [];
  const identifiersBuiltInThisParse = new Set<string>();

  for (const entry of pageEntries) {
    const { pageEntry, inputData } = entry;
    const inputDataSignal = getInputDataSignal(pageEntry.identifier);
    const existingInputData = inputDataSignal.peek();
    const shouldMergeOnly =
      paginateResponse &&
      existingInputData !== undefined &&
      ((hasComponentConfig?.(pageEntry.identifier) ?? true) ||
        identifiersBuiltInThisParse.has(pageEntry.identifier));

    if (shouldMergeOnly) {
      inputDataSignal.value = mergeInputData(existingInputData, inputData, mergeStrategy);
      continue;
    }

    inputDataSignal.value = inputData;

    const template = templateStore.getTemplateByRobloxComponent(pageEntry.robloxComponent);
    if (!template) {
      reportError(
        SduiErrorName.FailedToFindTemplate,
        `No template registered for robloxComponent "${pageEntry.robloxComponent}"`,
        pageContext,
        { name: pageEntry.identifier, componentType: pageEntry.robloxComponent },
        errorReporter,
      );
      continue;
    }

    const config = builder.buildConfigForComponent(template, inputDataSignal, {
      configKey,
      scope,
      pageContext,
    });
    if (!config) continue;

    config.identifier = pageEntry.identifier;
    results.push({
      config,
      identifier: pageEntry.identifier,
    });
    identifiersBuiltInThisParse.add(pageEntry.identifier);
  }

  return results;
}

// ─── Response Pipeline ───

/**
 * Walks a decoded SDUI API response and seeds every per-response store:
 * 1. Hydration data → data binder stores (via injected `parseHydrationData`)
 * 2. Templates → template store (via injected `parseTemplateEntries`)
 * 3. Localized literals → localized-literals store (internal — see note below)
 * 4. Page entries → component configs (via injected `parsePageEntries`)
 */
export function handleSduiApiResponse(
  response: SduiApiResponse,
  options: HandleResponseOptions,
): ParsedPageEntryConfig[] {
  applyResponseDataStores(response, options);

  options.loadTimer?.logConfigBuildBegin();
  const pageEntries = options.parsePageEntries(response.pageEntries, options);
  options.loadTimer?.logConfigBuildEnd();
  return pageEntries;
}
