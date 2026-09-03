import { renderWithErrorBoundary, TranslationProvider } from "@rbx/core-scripts/react";
import ready from "@rbx/core-scripts/util/ready";

import { translations } from "./component.json";
import App from "./src/App";
import "./src/main.css";
import ErrorView from "./src/components/ErrorView";
import ViewContainer from "./src/components/ViewContainer";

ready(() => {
  renderWithErrorBoundary(
    <TranslationProvider config={translations}>
      <App />
    </TranslationProvider>,
    document.getElementById("roblox-subscription-container"),
    undefined,
    <ViewContainer>
      <ErrorView />
    </ViewContainer>,
  );
});
