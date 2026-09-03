import "./src/main.css";
import ready from "@rbx/core-scripts/util/ready";
import { renderWithErrorBoundary, TranslationProvider } from "@rbx/core-scripts/react";
import ConfigurePrivateServerContainer from "./src/containers/ConfigurePrivateServerContainer";
import { translations } from "./component.json";
import {
  CONFIGURE_PRIVATE_SERVER_CONTAINER_ID,
  CONFIGURE_PRIVATE_SERVER_WEB_APP_ID,
} from "./src/constants/configurePrivateServerConstants";

const getPrivateServerIdFromUrl = (): string | null => {
  const pathSegments = window.location.pathname.split("/").filter(Boolean);
  return pathSegments.at(-1) ?? null;
};

ready(() => {
  const container =
    document.getElementById(CONFIGURE_PRIVATE_SERVER_WEB_APP_ID) ??
    document.getElementById(CONFIGURE_PRIVATE_SERVER_CONTAINER_ID);

  if (!container) {
    return;
  }

  container.classList.add("private-server-container");

  if (!container.dataset.privateServerId) {
    const privateServerId = getPrivateServerIdFromUrl();
    if (privateServerId) {
      container.dataset.privateServerId = privateServerId;
    }
  }

  renderWithErrorBoundary(
    <TranslationProvider config={translations}>
      <ConfigurePrivateServerContainer />
    </TranslationProvider>,
    container,
  );
});
