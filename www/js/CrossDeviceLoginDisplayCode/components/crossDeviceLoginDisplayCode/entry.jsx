import "./src/crossDeviceLoginDisplayCodeModal/crossDeviceLoginDisplayCodeModal.scss";
import ready from "@rbx/core-scripts/util/ready";
import { renderWithErrorBoundary } from "@rbx/core-scripts/react";
import Roblox from "Roblox";
import App from "@rbx/authentication/crossDeviceLoginDisplayCodeModal/App";
import { rootElementId } from "@rbx/authentication/crossDeviceLoginDisplayCodeModal/app.config";
import { openModal } from "@rbx/authentication/crossDeviceLoginDisplayCodeModal/services/crossDeviceLoginDisplayCodeService";

Roblox.CrossDeviceLoginDisplayCodeService = {
  openModal,
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
  renderApp();
});
