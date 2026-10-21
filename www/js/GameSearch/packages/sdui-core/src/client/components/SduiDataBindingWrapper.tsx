import { memo } from "react";
import { useSignals } from "@preact/signals-react/runtime";
import type {
  SduiActionResolver,
  SduiComponentConfig,
  SduiErrorReporter,
  SduiPageContext,
} from "../../types";
import type { SduiComponentRegistry } from "../../registry/SduiComponentRegistry";
import { SduiRenderer } from "../../renderer/SduiRenderer";
import { resolveInteractiveConfig } from "../utils/resolveInteractiveConfig";

/** Props for the client-only `interactiveWrapper` passed into `SduiRenderer`. */
export interface SduiDataBindingWrapperProps {
  config: SduiComponentConfig;
  registry: SduiComponentRegistry;
  errorReporter: SduiErrorReporter;
  pageContext: SduiPageContext;
  actionResolver?: SduiActionResolver;
}

/**
 * Reactive client-binding boundary: reads `propSignals` / `isComponentFilteredSignal`
 * under `useSignals()`, merges values into props (via `resolveInteractiveConfig`), then
 * renders through `SduiRenderer`. Returns null when filtered — same as Lua
 * `SduiDataBindingWrapper` in `createSduiClientBindingWrappers.lua`. Web additionally
 * merges per-prop `DataStatus` into `propStatuses`.
 */
export const SduiDataBindingWrapper = memo(function SduiDataBindingWrapper({
  config: componentConfig,
  registry,
  errorReporter,
  pageContext,
  actionResolver,
}: SduiDataBindingWrapperProps) {
  useSignals();

  const shouldHideSubtree = componentConfig.isComponentFilteredSignal?.value === true;
  if (shouldHideSubtree) {
    return null;
  }

  const { mergedConfig: configForRenderer, propStatuses } =
    resolveInteractiveConfig(componentConfig);

  return (
    <SduiRenderer
      config={configForRenderer}
      registry={registry}
      errorReporter={errorReporter}
      pageContext={pageContext}
      interactiveWrapper={SduiDataBindingWrapper}
      actionResolver={actionResolver}
      propStatuses={propStatuses}
    />
  );
});

SduiDataBindingWrapper.displayName = "SduiDataBindingWrapper";
