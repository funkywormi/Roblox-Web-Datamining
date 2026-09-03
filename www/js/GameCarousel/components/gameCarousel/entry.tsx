import ready from "@rbx/core-scripts/util/ready";
import { queryClient, renderWithErrorBoundary, TranslationProvider } from "@rbx/core-scripts/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { GameCarousel } from "@rbx/discovery-common";
import "@rbx/discovery-common/gameCarousel.scss";
import { translations } from "./component.json";
import "./src/main.css";

const gamesCarouselPageId = "games-carousel-page";
const gamesCarouselWebAppId = "game-carousel-web-app";

ready(() => {
  if (document.getElementById(gamesCarouselPageId)) {
    renderWithErrorBoundary(
      <TranslationProvider config={translations}>
        <QueryClientProvider client={queryClient}>
          {/* @ts-expect-error TODO: old, migrated code */}
          <GameCarousel />
        </QueryClientProvider>
      </TranslationProvider>,
      document.getElementById(gamesCarouselPageId),
    );
  } else if (document.getElementById(gamesCarouselWebAppId)) {
    renderWithErrorBoundary(
      <TranslationProvider config={translations}>
        <QueryClientProvider client={queryClient}>
          {/* @ts-expect-error TODO: old, migrated code */}
          <GameCarousel />
        </QueryClientProvider>
      </TranslationProvider>,
      document.getElementById(gamesCarouselWebAppId),
    );
  }
});
