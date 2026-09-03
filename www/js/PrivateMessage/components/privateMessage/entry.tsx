import ready from "@rbx/core-scripts/util/ready";
import { renderWithErrorBoundary, TranslationProvider } from "@rbx/core-scripts/react";
import App from "./src/App";
import { translations } from "./component.json";
import "./src/main.css";

const getContainer = (): HTMLElement | null =>
  document.getElementById("private-message") ?? document.getElementById("private-message-web-app");

ready(() => {
  const container = getContainer();
  if (!container) {
    return;
  }

  if (container.id === "private-message-web-app") {
    container.classList.add("messages-container");
  }

  renderWithErrorBoundary(
    <TranslationProvider config={translations}>
      <App />
    </TranslationProvider>,
    container,
  );
});
