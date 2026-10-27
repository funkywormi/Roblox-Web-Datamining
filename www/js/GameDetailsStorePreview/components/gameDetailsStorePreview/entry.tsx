import ready from "@rbx/core-scripts/util/ready";
import { renderWithErrorBoundary, TranslationProvider } from "@rbx/core-scripts/react";
import { GameStorePreviewExperiment } from "@rbx/discovery-common";
import { translations } from "./component.json";
import "./src/main.css";

ready(() => {
  const container = document.getElementById("game-details-about-store-preview");
  if (container) {
    renderWithErrorBoundary(
      <TranslationProvider config={translations}>
        <GameStorePreviewExperiment />
      </TranslationProvider>,
      container,
    );
  }
});
