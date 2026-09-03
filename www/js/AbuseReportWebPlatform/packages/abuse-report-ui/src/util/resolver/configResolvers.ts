import { resolveConfig } from "@rbx/abuse-report-config-types";
import type { NormalizedConfig, RawConfig } from "../../hooks/abuseSheetFlow/types";
import type { ConfigValue } from "../../types";

export { resolveConfig } from "@rbx/abuse-report-config-types";

export const resolveArConfig = (
  config: RawConfig,
  store: Record<string, ConfigValue>,
): NormalizedConfig => {
  // Since resources can be "inserted" into the config tree via $resource, we need to resolve them first.
  // (at least with the current leaf-first approach). Otherwise, you could insert a unresolved value
  // into the config tree and that value would not be resolved.
  const resources = resolveConfig<NormalizedConfig["resources"]>(config.resources, {
    store,
    attributes: config.attributes,
    resources: {},
  });

  const normalizedConfig = resolveConfig<NormalizedConfig>(config, {
    store,
    resources,
    attributes: config.attributes,
  });

  return normalizedConfig;
};
