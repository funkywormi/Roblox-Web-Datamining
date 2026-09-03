import { useCallback } from "react";
import { TranslationProvider } from "@rbx/core-scripts/react";
import { createFireTelemetryCounter } from "@rbx/web-telemetry/fire";

const trackError = createFireTelemetryCounter("PaymentsTranslationProvider");

const transformLabels = (key: string) => {
  return key.replaceAll(".", "_").replaceAll("-", "_");
};

export const PaymentsTranslationProvider = ({
  context,
  onEmptyString,
  ...props
}: React.ComponentProps<typeof TranslationProvider> & { context: string }) => {
  const handleError = useCallback(
    (key: string, locale: string) => {
      trackError("MissingKey", {
        key: transformLabels(key),
        locale: transformLabels(locale),
        context,
      });
      onEmptyString?.(key, locale);
    },
    [context, onEmptyString],
  );
  return <TranslationProvider {...props} onEmptyString={handleError} />;
};
