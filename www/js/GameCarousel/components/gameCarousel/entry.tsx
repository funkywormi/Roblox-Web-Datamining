import { QueryClientProvider } from "@tanstack/react-query";
import ready from "@rbx/core-scripts/util/ready";
import { queryClient, renderWithErrorBoundary, TranslationProvider } from "@rbx/core-scripts/react";
import { GameCarousel } from "@rbx/discovery-common";
import "@rbx/discovery-common/gameCarousel.scss";
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

const gamesCarouselPageId = "games-carousel-page";
const gamesCarouselWebAppId = "game-carousel-web-app";

ready(() => {
  if (document.getElementById(gamesCarouselPageId)) {
    renderWithErrorBoundary(
      <TranslationProviderSCC namespaces={namespaces}>
        <TranslationProvider config={translations}>
          <QueryClientProvider client={queryClient}>
            {/* @ts-expect-error TODO: old, migrated code */}
            <GameCarousel />
          </QueryClientProvider>
        </TranslationProvider>
      </TranslationProviderSCC>,
      document.getElementById(gamesCarouselPageId),
    );
  } else if (document.getElementById(gamesCarouselWebAppId)) {
    renderWithErrorBoundary(
      <TranslationProviderSCC namespaces={namespaces}>
        <TranslationProvider config={translations}>
          <QueryClientProvider client={queryClient}>
            {/* @ts-expect-error TODO: old, migrated code */}
            <GameCarousel />
          </QueryClientProvider>
        </TranslationProvider>
      </TranslationProviderSCC>,
      document.getElementById(gamesCarouselWebAppId),
    );
  }
});
