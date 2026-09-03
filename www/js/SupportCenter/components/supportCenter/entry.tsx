import ready from "@rbx/core-scripts/util/ready";
import { renderWithErrorBoundary } from "@rbx/core-scripts/react";
import App from "./src/App";
import "./src/main.css";

ready(() => {
  renderWithErrorBoundary(<App />, document.getElementById("support-center-web-app"));
});
