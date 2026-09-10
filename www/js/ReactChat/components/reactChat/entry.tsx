import { QueryClientProvider } from "@tanstack/react-query";
import ready from "@rbx/core-scripts/util/ready";
import { queryClient, renderWithErrorBoundary, TranslationProvider } from "@rbx/core-scripts/react";
import App from "./src/App";
import { translations } from "./component.json";
import "./src/main.scss";

ready(() => {
  const container = document.getElementById("chat-container");
  if (!container) {
    return;
  }

  renderWithErrorBoundary(
    <QueryClientProvider client={queryClient}>
      <TranslationProvider config={translations}>
        <App />
      </TranslationProvider>
    </QueryClientProvider>,
    container,
  );
});
