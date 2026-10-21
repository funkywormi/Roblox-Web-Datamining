import { QueryClientProvider } from "@tanstack/react-query";
import ready from "@rbx/core-scripts/util/ready";
import { queryClient, renderWithErrorBoundary, TranslationProvider } from "@rbx/core-scripts/react";
import { SystemFeedbackProvider } from "@rbx/core-ui";
import "@rbx/discovery-common/gameSearch.scss";
import { gamePlayButtonNamespaces } from "@rbx/game-play-button";
import type { Namespace } from "@rbx/www-common/i18n";
import { TranslationProviderSCC } from "@rbx/www-common/i18n/scc";
import App from "./src/App";
import { translations } from "./component.json";
import "./src/main.css";

// The game tiles' Play button reads its own namespaces from this provider too.
const namespaces = [
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- CI narrows Namespace; component.json is always valid
  ...(translations as unknown as readonly Namespace[]),
  ...gamePlayButtonNamespaces,
];

ready(() => {
  renderWithErrorBoundary(
    <TranslationProviderSCC namespaces={namespaces}>
      <TranslationProvider config={translations}>
        <QueryClientProvider client={queryClient}>
          <SystemFeedbackProvider>
            <App />
          </SystemFeedbackProvider>
        </QueryClientProvider>
      </TranslationProvider>
    </TranslationProviderSCC>,
    // games-search-page when pageDetails fetch succeeds and we need to inject into a div further down the DOM
    // game-search-web-app when pageDetails fetch fails or is disabled
    document.getElementById("games-search-page") ?? document.getElementById("game-search-web-app"),
  );
});
