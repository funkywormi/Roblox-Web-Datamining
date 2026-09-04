import { QueryClientProvider } from "@tanstack/react-query";
import ready from "@rbx/core-scripts/util/ready";
import { queryClient, renderWithErrorBoundary, TranslationProvider } from "@rbx/core-scripts/react";
import App from "./src/App";
import { translations } from "./component.json";
import "./src/main.css";

ready(() => {
  const container =
    document.getElementById("player-search-web-app") ??
    document.getElementById("player-search-container");

  if (!container) {
    return;
  }

  renderWithErrorBoundary(
    <TranslationProvider config={translations}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </TranslationProvider>,
    container,
  );
});
