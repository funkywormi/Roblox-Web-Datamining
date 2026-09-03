import ready from "@rbx/core-scripts/util/ready";
import { queryClient, renderWithErrorBoundary, TranslationProvider } from "@rbx/core-scripts/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { SystemFeedbackProvider } from "@rbx/core-ui";
import "@rbx/discovery-common/gameSearch.scss";
import App from "./src/App";
import { translations } from "./component.json";
import "./src/main.css";

ready(() => {
  renderWithErrorBoundary(
    <TranslationProvider config={translations}>
      <QueryClientProvider client={queryClient}>
        <SystemFeedbackProvider>
          <App />
        </SystemFeedbackProvider>
      </QueryClientProvider>
    </TranslationProvider>,
    // games-search-page when pageDetails fetch succeeds and we need to inject into a div further down the DOM
    // game-search-web-app when pageDetails fetch fails or is disabled
    document.getElementById("games-search-page") ?? document.getElementById("game-search-web-app"),
  );
});
