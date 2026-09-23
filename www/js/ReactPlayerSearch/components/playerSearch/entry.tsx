import { QueryClientProvider } from "@tanstack/react-query";
import ready from "@rbx/core-scripts/util/ready";
import resolveWebAppContainer from "@rbx/core-scripts/util/web-app-container";
import { queryClient, renderWithErrorBoundary, TranslationProvider } from "@rbx/core-scripts/react";
import App from "./src/App";
import { translations } from "./component.json";
import "./src/main.css";

ready(() => {
  renderWithErrorBoundary(
    <TranslationProvider config={translations}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </TranslationProvider>,
    resolveWebAppContainer(
      "react-player-search-web-app",
      "player-search-web-app",
      "player-search-container",
    ),
  );
});
