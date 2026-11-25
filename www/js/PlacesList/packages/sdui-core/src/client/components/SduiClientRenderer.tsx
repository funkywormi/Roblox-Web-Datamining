import { memo, useMemo } from "react";
import { createActionResolver } from "../../actions/createActionResolver";
import { SduiRenderer } from "../../renderer/SduiRenderer";
import type { SduiComponentConfig } from "../../types";
import { useSduiServices } from "../context/SduiProvider";
import { SduiDataBindingWrapper } from "./SduiDataBindingWrapper";

export interface SduiClientRendererProps {
  config: SduiComponentConfig;
}

/**
 * Client entry point for recursive SDUI rendering. Reads services from
 * `SduiProvider`, builds the per-render `actionResolver`, and delegates to
 * the isomorphic `SduiRenderer` with `SduiDataBindingWrapper` injected as
 * the wrapper for signal-bound subtrees.
 *
 * Memoized so that signal-driven sibling re-renders skip subtrees whose
 * `config` reference is stable.
 */
export const SduiClientRenderer = memo(({ config }: SduiClientRendererProps) => {
  const services = useSduiServices();
  const actionResolver = useMemo(
    () => createActionResolver(services, services.configKey, config.identifier),
    [services, config.identifier],
  );

  return (
    <SduiRenderer
      config={config}
      registry={services.componentRegistry}
      errorReporter={services.errorReporter}
      pageContext={services.pageContext}
      interactiveWrapper={SduiDataBindingWrapper}
      actionResolver={actionResolver}
    />
  );
});

SduiClientRenderer.displayName = "SduiClientRenderer";
