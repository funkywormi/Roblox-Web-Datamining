import { QueryClientProvider } from "@tanstack/react-query";
import ready from "@rbx/core-scripts/util/ready";
import { renderWithErrorBoundary, TranslationProvider, queryClient } from "@rbx/core-scripts/react";
import { AgeRecommendationTitle } from "@rbx/discovery-common";
import { translations } from "./component.json";
import "./src/gameGuidelines.scss";
import "./src/main.css";

ready(() => {
  const ageRecommendationDetailContainer = document.getElementById(
    "game-age-recommendation-details",
  );
  if (ageRecommendationDetailContainer) {
    renderWithErrorBoundary(
      <QueryClientProvider client={queryClient}>
        <TranslationProvider config={translations}>
          <AgeRecommendationTitle isDisplayAgeRecommendationDetails />
        </TranslationProvider>
      </QueryClientProvider>,
      ageRecommendationDetailContainer,
    );
  }

  const ageRecommendationTitleContainer = document.getElementById(
    "game-age-recommendation-container",
  );
  if (ageRecommendationTitleContainer) {
    renderWithErrorBoundary(
      <QueryClientProvider client={queryClient}>
        <TranslationProvider config={translations}>
          <AgeRecommendationTitle isDisplayAgeRecommendationDetails={false} />
        </TranslationProvider>
      </QueryClientProvider>,
      ageRecommendationTitleContainer,
    );
  }
});
