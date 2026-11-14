import { QueryClientProvider } from "@tanstack/react-query";
import ready from "@rbx/core-scripts/util/ready";
import { queryClient, renderWithErrorBoundary, TranslationProvider } from "@rbx/core-scripts/react";
import { gamePlayButtonNamespaces } from "@rbx/game-play-button";
import type { Namespace } from "@rbx/www-common/i18n";
import { TranslationProviderSCC } from "@rbx/www-common/i18n/scc";
import { translations } from "./component.json";
import SduiLandingPageContainerWithSession from "./src/components/SduiLandingPageContainer";
import { getSduiLandingPageContainerElement } from "./src/sduiLandingPageConfiguration";
import "./src/css/sduiLandingPage.css";
import "./src/main.css";

// The SDUI Play button and game tiles read their own namespaces from this provider too.
const namespaces = [
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- CI narrows Namespace; component.json is always valid
  ...(translations as unknown as readonly Namespace[]),
  ...gamePlayButtonNamespaces,
];

ready(() => {
  const containerElement = getSduiLandingPageContainerElement(window.location.pathname);
  if (!containerElement) {
    return;
  }

  renderWithErrorBoundary(
    <TranslationProviderSCC namespaces={namespaces}>
      <TranslationProvider config={translations}>
        <QueryClientProvider client={queryClient}>
          <SduiLandingPageContainerWithSession />
        </QueryClientProvider>
      </TranslationProvider>
    </TranslationProviderSCC>,
    containerElement,
  );
});
