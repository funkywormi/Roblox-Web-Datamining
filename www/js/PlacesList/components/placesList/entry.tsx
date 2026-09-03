import ready from "@rbx/core-scripts/util/ready";
import { queryClient, renderWithErrorBoundary, TranslationProvider } from "@rbx/core-scripts/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { HomePage, HomePageContainer } from "@rbx/discovery-common";
import "@rbx/discovery-common/realtimePlacelist.scss";
import { translations } from "./component.json";
import "./src/main.css";

ready(() => {
  const homePageContainer = document.getElementById("place-list");
  const placesListContainer = document.getElementById("places-list-web-app");
  if (homePageContainer) {
    renderWithErrorBoundary(
      <TranslationProvider config={translations}>
        <QueryClientProvider client={queryClient}>
          {/* @ts-expect-error: TODO: old, migrated code */}
          <HomePage />
        </QueryClientProvider>
      </TranslationProvider>,
      homePageContainer,
    );
  } else if (placesListContainer && document.getElementById("content")) {
    // need to render in content div for css to work properly
    renderWithErrorBoundary(
      <TranslationProvider config={translations}>
        <QueryClientProvider client={queryClient}>
          <HomePageContainer />
        </QueryClientProvider>
      </TranslationProvider>,
      document.getElementById("content"),
    );
  } else {
    window.EventTracker?.fireEvent("HomePageMissingContainerDiv");
  }
});
