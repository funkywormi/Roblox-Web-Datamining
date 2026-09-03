import { useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { UIThemeProvider } from "@rbx/ui";
import { queryClient, useTheme } from "@rbx/core-scripts/react";
import { ArwpBeduiProvider } from "./context/ArwpBeduiProvider";
import ArwpFlowHandler from "./components/ArwpFlowHandler";
import { ArwpFormDataProvider } from "./context/ArwpFormDataProvider";
import ArwpDialogModeContainer from "./components/ArwpDialogModeContainer";
import sendAnalyticsEvent, { TelemetryEventType } from "./utils/sendAnalyticsEvent";
import { useSearchParams } from "./context/ArwpUrlParamProvider";

const ArwpContainer = () => {
  const theme = useTheme();
  const { abuseVector, targetId, dialogModeEnabled } = useSearchParams();

  useEffect(() => {
    sendAnalyticsEvent({
      abuseVector,
      eventType: TelemetryEventType.Rendered,
    });
  }, [abuseVector]);

  if (dialogModeEnabled) {
    return (
      <UIThemeProvider theme={theme} cssBaselineMode="disabled">
        <ArwpDialogModeContainer abuseVector={abuseVector} targetIdStr={targetId} />
      </UIThemeProvider>
    );
  }

  return (
    <UIThemeProvider theme={theme} cssBaselineMode="disabled">
      <div className="abuse-report-container" data-testid="abuse-report-container">
        <ArwpBeduiProvider>
          <ArwpFormDataProvider>
            <QueryClientProvider client={queryClient}>
              <ArwpFlowHandler />
            </QueryClientProvider>
          </ArwpFormDataProvider>
        </ArwpBeduiProvider>
      </div>
    </UIThemeProvider>
  );
};

export default ArwpContainer;
