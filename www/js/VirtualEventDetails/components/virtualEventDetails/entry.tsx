import "./src/main.css";
import { ready } from "@rbx/core-scripts/legacy/core-utilities";
import { queryClient, renderWithErrorBoundary } from "@rbx/core-scripts/react";
import { QueryClientProvider } from "@tanstack/react-query";
// @ts-expect-error - App is a JSX component without type definitions
import App from "./src/components/App";
import "./src/css/virtualEventDetails/virtualEventDetails.scss";

ready(() => {
  const webAppContainer =
    document.getElementById("virtual-event-details-web-app") ||
    document.getElementById("virtual-event-detail");
  renderWithErrorBoundary(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>,
    webAppContainer,
  );
});
