import ready from "@rbx/core-scripts/util/ready";
import { renderWithErrorBoundary, TranslationProvider } from "@rbx/core-scripts/react";
import { CommunityLinkDisplay } from "@rbx/discovery-common";
import { translations } from "./component.json";
import "./src/gameCommunity.scss";
import "./src/main.css";

const communityDetailsContainer = "game-community-link-container";

ready(() => {
  const container = document.getElementById(communityDetailsContainer);
  if (container) {
    renderWithErrorBoundary(
      <TranslationProvider config={translations}>
        <CommunityLinkDisplay />
      </TranslationProvider>,
      container,
    );
  }
});
