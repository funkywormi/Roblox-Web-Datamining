import React from "react";
import { TranslationProvider, useTheme } from "react-utilities";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { UIThemeProvider } from "@rbx/ui";
import { queryClient } from "@rbx/core-scripts/react";
import translationConfig from "./translation.config";
import "../../../css/subscriptionManagement/subscriptionManagement.scss";
import ManagementContainer from "./containers/ManagementContainer";
import SystemFeedbackProvider from "../shared/providers/SystemFeedbackProvider";

const App: React.FC = () => {
  const theme = useTheme();

  return (
    <UIThemeProvider
      theme={theme === "dark" ? "foundation-dark" : "foundation-light"}
      cssBaselineMode="disabled"
    >
      <QueryClientProvider client={queryClient}>
        <TranslationProvider config={translationConfig}>
          <SystemFeedbackProvider>
            <BrowserRouter>
              <ManagementContainer />
            </BrowserRouter>
          </SystemFeedbackProvider>
        </TranslationProvider>
      </QueryClientProvider>
    </UIThemeProvider>
  );
};

export default App;
