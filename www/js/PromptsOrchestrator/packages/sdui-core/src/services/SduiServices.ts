import {
  createSduiLoadTimerRegistry,
  type SduiLoadTimerRegistry,
} from "../performance/SduiLoadTimerRegistry";
import { createSduiBuilder } from "../binding/SduiBuilder";
import { createSduiDataBinder } from "../binding/SduiDataBinder";
import { createHydrationStores } from "../binding/stores";
import type { SduiActionHandlerRegistry } from "../registry/SduiActionHandlerRegistry";
import type { SduiComponentRegistry } from "../registry/SduiComponentRegistry";
import type { SduiImpressionHandlerRegistry } from "../registry/SduiImpressionHandlerRegistry";
import type { SduiTelemetryHandlerNameRegistry } from "../registry/SduiTelemetryHandlerNameRegistry";
import { createSduiApiStore } from "../store/SduiApiStore";
import { createSduiTemplateStore } from "../store/SduiTemplateStore";
import type {
  HydrationContent,
  HydrationStore,
  SduiAnalyticsReporter,
  SduiApiStore,
  SduiBuilder,
  SduiDataBinder,
  SduiErrorReporter,
  SduiPageContext,
  SduiTemplateStore,
  TranslateFunction,
} from "../types";

// ─── Public Types ───

export interface SduiServices {
  apiStore: SduiApiStore;
  templateStore: SduiTemplateStore;
  dataBinder: SduiDataBinder;
  builder: SduiBuilder;
  componentRegistry: SduiComponentRegistry;
  actionHandlerRegistry: SduiActionHandlerRegistry;
  telemetryHandlerNameRegistry: SduiTelemetryHandlerNameRegistry;
  impressionHandlerRegistry: SduiImpressionHandlerRegistry;
  analyticsReporter: SduiAnalyticsReporter;
  errorReporter: SduiErrorReporter;
  loadTimerRegistry: SduiLoadTimerRegistry;
  pageContext: SduiPageContext;
  translate?: TranslateFunction;
}

export interface CreateSduiServicesOptions {
  componentRegistry: SduiComponentRegistry;
  actionHandlerRegistry: SduiActionHandlerRegistry;
  telemetryHandlerNameRegistry: SduiTelemetryHandlerNameRegistry;
  impressionHandlerRegistry: SduiImpressionHandlerRegistry;
  analyticsReporter: SduiAnalyticsReporter;
  errorReporter: SduiErrorReporter;
  /** Identifies the page/surface for telemetry. */
  pageContext: SduiPageContext;
  /** Seed entity hydration data at creation time. */
  initialHydrationData?: HydrationContent;

  /** Locale-aware translate function. */
  translate?: TranslateFunction;
}

// ─── Service Construction ───

/**
 * Build a complete set of SDUI service instances against a caller-supplied
 * store map. Prefer `createSduiServices`, which wires the canonical
 * `createHydrationStores()` map; use this variant only when a non-default
 * map is required (jest tests, embedded sandboxes).
 */
export function createSduiServicesWithStores(
  stores: Record<string, HydrationStore>,
  options: CreateSduiServicesOptions,
): SduiServices {
  const {
    componentRegistry,
    actionHandlerRegistry,
    telemetryHandlerNameRegistry,
    impressionHandlerRegistry,
    analyticsReporter,
    errorReporter,
    pageContext,
  } = options;
  const loadTimerRegistry = createSduiLoadTimerRegistry(errorReporter);

  const templateStore = createSduiTemplateStore();
  const dataBinder = createSduiDataBinder({
    errorReporter,
    pageContext,
    initialStores: stores,
  });

  if (options.initialHydrationData) {
    dataBinder.updateDataStores(options.initialHydrationData);
  }

  const builder = createSduiBuilder({
    dataBinder,
    templateStore,
    errorReporter,
  });

  const apiStore = createSduiApiStore({
    templateStore,
    dataBinder,
    builder,
    errorReporter,
    analyticsReporter,
    loadTimerRegistry,
    pageContext,
  });

  return {
    apiStore,
    templateStore,
    dataBinder,
    builder,
    componentRegistry,
    actionHandlerRegistry,
    telemetryHandlerNameRegistry,
    impressionHandlerRegistry,
    analyticsReporter,
    errorReporter,
    loadTimerRegistry,
    pageContext,
    translate: options.translate,
  };
}

/**
 * Create a complete set of SDUI service instances wired together with the
 * canonical `createHydrationStores()` store map.
 *
 * - **CSR:** call once at app root and reuse for the session lifetime.
 * - **SSR:** call per request; instances are garbage collected with the response.
 *
 * The store map is hard-wired so the registered set of content types stays
 * auditable from one canonical site (`createHydrationStores.ts`). Tests
 * that genuinely need a different map should use
 * `createSduiServicesWithStores`.
 *
 * SSR note: stores default to `mode: 'passive'` when `typeof window`
 * indicates the server, suppressing read-triggered fetches. Data must
 * arrive via `initialHydrationData` (or a later `applyUpdate`) and is
 * serialized for client transfer via `dataBinder.getStores()`.
 */
export function createSduiServices(options: CreateSduiServicesOptions): SduiServices {
  return createSduiServicesWithStores(createHydrationStores(options.translate), options);
}

// ─── Page-scoped Service Registry (CSR only) ───

const pageServicesByKey = new Map<string, SduiServices>();

/**
 * Return the existing page-scoped services instance.
 *
 * Use for lookup-only call sites that must not create a partially configured
 * service graph.
 */
export function getPageServices(pageKey: string): SduiServices {
  const services = pageServicesByKey.get(pageKey);
  if (!services) {
    throw new Error(`SDUI services have not been created for page "${pageKey}".`);
  }

  return services;
}

/**
 * Get or lazily create a shared `SduiServices` instance for a page. The
 * same `pageKey` always returns the same instance; subsequent callers'
 * options are ignored.
 *
 * Use when a page has multiple React mount points that need to share
 * hydration data, templates, and API caches. CSR only — SSR should call
 * `createSduiServices()` directly per request.
 */
export function getOrCreatePageServices(
  pageKey: string,
  options: CreateSduiServicesOptions,
): SduiServices {
  const existing = pageServicesByKey.get(pageKey);
  if (existing) return existing;

  const created = createSduiServices(options);
  pageServicesByKey.set(pageKey, created);
  return created;
}

/**
 * Clean up services for a page. Clears every registered store so
 * hydration data does not leak across navigations, then drops the
 * registry entry.
 *
 * Process-singleton stores (`AuthStore`, `ResponsiveStore`) override
 * `clear()` to re-seed from their source so the next page's reads return
 * current truth instead of `undefined`. The `WeakMap`-cached instances and any
 * attached `window` listeners are preserved.
 */
export function disposePageServices(pageKey: string): void {
  const services = pageServicesByKey.get(pageKey);
  if (!services) return;

  services.apiStore.clear();
  services.dataBinder.clear();
  services.templateStore.clear();
  pageServicesByKey.delete(pageKey);
}

/** Whether a page-scoped services instance exists for the given key. */
export function hasPageServices(pageKey: string): boolean {
  return pageServicesByKey.has(pageKey);
}
