import ready from "@rbx/core-scripts/util/ready";
import { queryClient, renderWithErrorBoundary, TranslationProvider } from "@rbx/core-scripts/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { HomePage, HomePageContainer } from "@rbx/discovery-common";
import "@rbx/discovery-common/realtimePlacelist.scss";
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

ready(() => {
  const homePageContainer = document.getElementById("place-list");
  const placesListContainer = document.getElementById("places-list-web-app");
  if (homePageContainer) {
    renderWithErrorBoundary(
      <TranslationProviderSCC namespaces={namespaces}>
        <TranslationProvider config={translations}>
          <QueryClientProvider client={queryClient}>
            {/* @ts-expect-error: TODO: old, migrated code */}
            <HomePage />
          </QueryClientProvider>
        </TranslationProvider>
      </TranslationProviderSCC>,
      homePageContainer,
    );
  } else if (placesListContainer && document.getElementById("content")) {
    // need to render in content div for css to work properly
    renderWithErrorBoundary(
      <TranslationProviderSCC namespaces={namespaces}>
        <TranslationProvider config={translations}>
          <QueryClientProvider client={queryClient}>
            <HomePageContainer />
          </QueryClientProvider>
        </TranslationProvider>
      </TranslationProviderSCC>,
      document.getElementById("content"),
    );
  } else {
    window.EventTracker?.fireEvent("HomePageMissingContainerDiv");
  }
});
