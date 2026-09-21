import "./main.css";
import { ready } from "@rbx/core-scripts/legacy/core-utilities";
import { renderWithErrorBoundary, TranslationProvider } from "@rbx/core-scripts/react";
import { jsClientDeviceIdentifier } from "@rbx/core-scripts/legacy/header-scripts";
import App from "./src/App";
import type { BrowserDetection } from "./src/types";
import { translations } from "./component.json";

const browserDetection: BrowserDetection = {
  isUnsupportedBrowser: jsClientDeviceIdentifier.isIE,
  isWindows: jsClientDeviceIdentifier.isWindows,
};

ready(() => {
  const webAppContainer =
    document.getElementById("supported-browsers-web-app") ??
    document.getElementById("supported-browsers");
  renderWithErrorBoundary(
    <TranslationProvider config={translations}>
      <App browserDetection={browserDetection} />
    </TranslationProvider>,
    webAppContainer,
  );
});
