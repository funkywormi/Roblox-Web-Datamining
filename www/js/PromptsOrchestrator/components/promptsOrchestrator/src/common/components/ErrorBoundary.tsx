import { SduiErrorBoundary } from "@rbx/sdui-core/client";

import type { PromptEntryPoint } from "../constants/promptEntryPointConstants";
import { SURFACE_CONFIGS } from "../constants/surfaceConfig";
import { PromptError } from "../telemetry/promptErrors";
import { getPromptsErrorReporter } from "../telemetry/promptsErrorReporter";
import type { ErrorBoundaryProps } from "./types";

/**
 * Catches render-time exceptions from descendants, forwards them to the prompts
 * error reporter, and renders either a caller-supplied `fallback` component or `null`.
 */
export function ErrorBoundary({
  entryPoint,
  componentType,
  ...props
}: ErrorBoundaryProps & { entryPoint: PromptEntryPoint }) {
  const { appPage } = SURFACE_CONFIGS[entryPoint];

  const handleError = (error: Error) => {
    getPromptsErrorReporter().reportPromptError(
      PromptError.render.uncaught({
        appPage,
        componentType,
        errorMessage: error.message,
      }),
    );
  };

  return <SduiErrorBoundary {...props} onError={handleError} />;
}
