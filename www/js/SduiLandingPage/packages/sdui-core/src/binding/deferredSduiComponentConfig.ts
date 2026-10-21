import { reportFailedToParse, reportError, stringifyError, SduiErrorName } from "../errors";
import type { BindingContext, SduiComponentConfig, UiComponentType } from "../types";

type DeferredConfigState = {
  build: () => SduiComponentConfig | undefined;
  ctx?: BindingContext;
};

const deferredConfigStates = new WeakMap<SduiComponentConfig, DeferredConfigState>();
/** Shells whose deferred build threw or returned nothing — skip on later materialize. */
const failedDeferredConfigs = new WeakSet<SduiComponentConfig>();

export function createDeferredSduiComponentConfig(
  componentType: UiComponentType,
  build: () => SduiComponentConfig | undefined,
  ctx?: BindingContext,
): SduiComponentConfig {
  const config: SduiComponentConfig = {
    __sduiKind: "config",
    componentType,
    props: {},
  };
  deferredConfigStates.set(config, { build, ...(ctx ? { ctx } : {}) });
  return config;
}

export function isDeferredSduiComponentConfig(config: SduiComponentConfig): boolean {
  return deferredConfigStates.has(config);
}

/**
 * Builds a deferred config once and fills its shell in place so list identity,
 * React keys, and pool placement stay stable.
 *
 * Returns `undefined` when the build throws or returns nothing, matching the
 * eager path that skips those entries. A later call for the same shell also
 * returns `undefined` so an empty-props component is never rendered.
 */
export function materializeSduiComponentConfig(
  config: SduiComponentConfig,
): SduiComponentConfig | undefined {
  if (failedDeferredConfigs.has(config)) {
    return undefined;
  }

  const state = deferredConfigStates.get(config);
  if (!state) {
    return config;
  }
  deferredConfigStates.delete(config);

  let builtConfig: SduiComponentConfig | undefined;
  try {
    builtConfig = state.build();
  } catch (err) {
    const message = `Deferred ComponentList item threw: ${stringifyError(err)}`;
    if (state.ctx) {
      reportFailedToParse(state.ctx, message);
    } else {
      reportError(SduiErrorName.FailedToParseProp, message);
    }
    failedDeferredConfigs.add(config);
    return undefined;
  }

  if (!builtConfig) {
    failedDeferredConfigs.add(config);
    return undefined;
  }

  const identity = {
    ...(config.identifier !== undefined ? { identifier: config.identifier } : {}),
    ...(config.reactKey !== undefined ? { reactKey: config.reactKey } : {}),
    ...(config.poolPlacement !== undefined ? { poolPlacement: config.poolPlacement } : {}),
  };
  Object.assign(config, builtConfig, identity);
  return config;
}
