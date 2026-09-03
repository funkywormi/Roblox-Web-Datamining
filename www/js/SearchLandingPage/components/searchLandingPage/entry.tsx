import ready from "@rbx/core-scripts/util/ready";
import { queryClient, renderWithErrorBoundary, TranslationProvider } from "@rbx/core-scripts/react";
import { QueryClientProvider } from "@tanstack/react-query";
import "@rbx/core-scripts/global";
import { SearchLandingPageOmniFeed, searchLandingService } from "@rbx/discovery-common";
import "@rbx/discovery-common/searchLandingPage.scss";
import { translations } from "./component.json";
import "./src/main.css";

// Expose service to internal apps
// @ts-expect-error TODO: old, migrated code
window.Roblox.SearchLandingService = searchLandingService;

function renderApp() {
  const container = document.getElementById("search-landing-root");
  if (container === null) {
    window.EventTracker?.fireEvent("SearchLandingPageMountError");
    return;
  }

  renderWithErrorBoundary(
    <TranslationProvider config={translations}>
      <QueryClientProvider client={queryClient}>
        <SearchLandingPageOmniFeed />
      </QueryClientProvider>
    </TranslationProvider>,
    container,
  );
}

ready(() => {
  window.addEventListener(searchLandingService.ModalEvent.MountSearchLanding, () => {
    renderApp();
  });
});
