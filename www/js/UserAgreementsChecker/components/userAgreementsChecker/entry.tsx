import "@rbx/site-status/css/userAgreementsChecker/userAgreementsChecker.scss";
import { ready } from "@rbx/core-scripts/legacy/core-utilities";
import { renderWithErrorBoundary, TranslationProvider } from "@rbx/core-scripts/react";
// @ts-expect-error - importing from .jsx file
import App from "@rbx/site-status/js/react/userAgreementsChecker/App";
import { translations } from "./component.json";

const userAgreementsCheckerContainerId = "user-agreements-checker-container";

ready(() => {
  const containerElement = document.getElementById(userAgreementsCheckerContainerId);
  if (containerElement !== null) {
    renderWithErrorBoundary(
      <TranslationProvider config={translations}>
        <App />
      </TranslationProvider>,
      containerElement,
    );
  }
});
