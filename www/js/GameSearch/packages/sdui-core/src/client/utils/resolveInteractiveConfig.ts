import type { DataStatus, SduiComponentConfig } from "../../types";

export interface ResolvedInteractiveConfig {
  mergedConfig: SduiComponentConfig;
  propStatuses?: Record<string, DataStatus>;
}

/**
 * Materialize `propSignals` into plain `props` and fold per-prop `DataStatus`
 * into `propStatuses`. Must run under a signal tracking scope (e.g.
 * `useSignals()` in `SduiDataBindingWrapper`) so `.value` reads subscribe.
 *
 * Strips `propSignals` and `isComponentFilteredSignal` so the isomorphic
 * renderer does not re-enter the interactive wrapper.
 *
 * Lua: `buildWrappedComponent` merges each signal’s `.data` into props only;
 * web also passes `propStatuses` for loading/error affordances on bound leaves.
 */
export function resolveInteractiveConfig(
  componentConfig: SduiComponentConfig,
): ResolvedInteractiveConfig {
  const propsFromSignals: Record<string, unknown> = {};
  const statusesFromSignals: Record<string, DataStatus> = {};

  for (const [propName, propSignalEntry] of Object.entries(componentConfig.propSignals ?? {})) {
    propsFromSignals[propName] = propSignalEntry.value.value;

    if (propSignalEntry.status) {
      statusesFromSignals[propName] = propSignalEntry.status.value;
    }
  }

  return {
    mergedConfig: {
      ...componentConfig,
      props: {
        ...componentConfig.props,
        ...propsFromSignals,
      },
      propSignals: undefined,
      isComponentFilteredSignal: undefined,
    },
    propStatuses: Object.keys(statusesFromSignals).length > 0 ? statusesFromSignals : undefined,
  };
}
