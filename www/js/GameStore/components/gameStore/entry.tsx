import ready from "@rbx/core-scripts/util/ready";
import { renderWithErrorBoundary, TranslationProvider } from "@rbx/core-scripts/react";
import { GameStore } from "@rbx/discovery-common";
import { translations } from "./component.json";
import "./src/gameStore.scss";
import "./src/main.css";

ready(() => {
  const container = document.getElementById("game-store-container");
  if (container) {
    renderWithErrorBoundary(
      <TranslationProvider config={translations}>
        <GameStore />
      </TranslationProvider>,
      container,
    );
  }
});
