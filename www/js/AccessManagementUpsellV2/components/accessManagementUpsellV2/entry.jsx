import "./src/main.css";
import "@rbx/verification/css/accessManagementUpsellV2/accessManagementUpsellV2.scss";
import ready from "@rbx/core-scripts/util/ready";
import { renderWithErrorBoundary } from "@rbx/core-scripts/react";
import Roblox from "Roblox";
import App from "@rbx/verification/accessManagementUpsellV2/App";
import { rootElementId } from "@rbx/verification/accessManagementUpsellV2/app.config";
import { startAccessManagementUpsell } from "@rbx/verification/accessManagementUpsellV2/services/accessManagementUpsellService";

Roblox.AccessManagementUpsellV2Service = {
  startAccessManagementUpsell,
};

function renderApp() {
  const entryPoint = document.getElementById(rootElementId);
  if (entryPoint) {
    renderWithErrorBoundary(<App />, entryPoint);
  } else {
    window.requestAnimationFrame(renderApp);
  }
}

ready(() => {
  if (rootElementId) {
    renderApp();
  }
});
