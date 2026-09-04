import { QueryClientProvider } from "@tanstack/react-query";
import ready from "@rbx/core-scripts/util/ready";
import { queryClient, renderWithErrorBoundary, TranslationProvider } from "@rbx/core-scripts/react";
import {
  getSduiLandingPageContainerElement,
  SduiLandingPageContainer,
} from "@rbx/discovery-common";
import "@rbx/discovery-common/sduiLandingPage.scss";
import "@rbx/discovery-common/sduiIcons.scss";
import { translations } from "./component.json";
import "./src/main.css";

ready(() => {
  const containerElement = getSduiLandingPageContainerElement(window.location.pathname);
  if (!containerElement) {
    return;
  }

  renderWithErrorBoundary(
    <TranslationProvider config={translations}>
      <QueryClientProvider client={queryClient}>
        {/* @ts-expect-error TODO: old, migrated code */}
        <SduiLandingPageContainer />
      </QueryClientProvider>
    </TranslationProvider>,
    containerElement,
  );
});
