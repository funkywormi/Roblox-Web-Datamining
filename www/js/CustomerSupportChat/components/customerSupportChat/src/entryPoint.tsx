import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ready } from "@rbx/core-scripts/legacy/core-utilities";
import { renderWithErrorBoundary } from "@rbx/core-scripts/react";
import { TranslationProvider } from "@rbx/core-scripts/legacy/react-utilities";

import { SupportContextProvider } from "./providers/SupportContextProvider";
import { createSupportRootElementId, supportChatTranslationConfig } from "./app.config";
import App from "./App";

import "./css/output.css";
import "./css/common.scss";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // by default react-query eagerly fetches when you change focus to the browser window
      // this seems to be causing errors and the page shows an error
      // it seems best to just turn this off by default
      refetchOnWindowFocus: false,
      // we should only opt-in for retry/refetch.
      retry: false,
      refetchOnMount: false,
    },
  },
});

function renderApp() {
  const entryPoint = document.getElementById(createSupportRootElementId);
  if (entryPoint) {
    const appWithProviders = (
      <QueryClientProvider client={queryClient}>
        <SupportContextProvider>
          <TranslationProvider config={supportChatTranslationConfig}>
            <App />
          </TranslationProvider>
        </SupportContextProvider>
      </QueryClientProvider>
    );

    renderWithErrorBoundary(appWithProviders, entryPoint);
  } else {
    // Recursively call renderApp if target div not found
    // Callback will be triggered before every repaint
    window.requestAnimationFrame(renderApp);
  }
}

ready(() => {
  renderApp();
});
