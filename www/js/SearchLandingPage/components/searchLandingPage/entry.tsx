import ready from "@rbx/core-scripts/util/ready";
import { queryClient, renderWithErrorBoundary, TranslationProvider } from "@rbx/core-scripts/react";
import { QueryClientProvider } from "@tanstack/react-query";
import "@rbx/core-scripts/global";
import { SearchLandingPageOmniFeed, searchLandingService } from "@rbx/discovery-common";
import "@rbx/discovery-common/searchLandingPage.scss";
import { gamePlayButtonNamespaces } from "@rbx/game-play-button";
import type { Namespace } from "@rbx/www-common/i18n";
import { TranslationProviderSCC } from "@rbx/www-common/i18n/scc";
import { translations } from "./component.json";
import "./src/main.css";

// The game tiles' Play button reads its own namespaces from this provider too.
const namespaces = [
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- CI narrows Namespace; component.json is always valid
  ...(translations as unknown as readonly Namespace[]),
  ...gamePlayButtonNamespaces,
];

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
    <TranslationProviderSCC namespaces={namespaces}>
      <TranslationProvider config={translations}>
        <QueryClientProvider client={queryClient}>
          <SearchLandingPageOmniFeed />
        </QueryClientProvider>
      </TranslationProvider>
    </TranslationProviderSCC>,
    container,
  );
}

ready(() => {
  window.addEventListener(searchLandingService.ModalEvent.MountSearchLanding, () => {
    renderApp();
  });
});
