import "./src/main.css";
import "@rbx/verification/css/accessManagementUpsellV2/accessManagementUpsellV2.css";
import ready from "@rbx/core-scripts/util/ready";
import { renderWithErrorBoundary } from "@rbx/core-scripts/react";
import { TranslationProviderSCC } from "@rbx/www-common/i18n/scc";
import Roblox from "Roblox";
import App from "@rbx/verification/accessManagementUpsellV2/App";
import { rootElementId } from "@rbx/verification/accessManagementUpsellV2/app.config";
import { startAccessManagementUpsell } from "@rbx/verification/accessManagementUpsellV2/services/accessManagementUpsellService";
import { translations } from "./component.json";

Roblox.AccessManagementUpsellV2Service = {
  startAccessManagementUpsell,
};

function renderApp() {
  const entryPoint = document.getElementById(rootElementId);
  if (entryPoint) {
    renderWithErrorBoundary(
      <TranslationProviderSCC namespaces={translations}>
        <App />
      </TranslationProviderSCC>,
      entryPoint,
    );
  } else {
    window.requestAnimationFrame(renderApp);
  }
}

ready(() => {
  if (rootElementId) {
    renderApp();
  }
});
