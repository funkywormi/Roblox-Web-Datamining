import { QueryClientProvider } from "@tanstack/react-query";
import ready from "@rbx/core-scripts/util/ready";
import { queryClient, renderWithErrorBoundary } from "@rbx/core-scripts/react";
import { gamePlayButtonNamespaces } from "@rbx/game-play-button";
import { TranslationProviderSCC } from "@rbx/www-common/i18n/scc";
import type { Namespace } from "@rbx/www-common/i18n";
import { trackDotnetAppShellCounter } from "@rbx/www-common/observability/app-shell/dotnet";
import App from "./src/App";
import GameCardPlayButton from "./src/components/ChatDialog/GameCard/GameCardPlayButton";
import GameCardPlayButtonContext from "./src/components/ChatDialog/GameCard/GameCardPlayButtonContext";
import { translations as rawTranslations } from "./component.json";
import "./src/main.css";

// The game card's Play button reads its own namespaces from this provider too.
const translations = [
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- CI narrows Namespace; component.json is always valid
  ...(rawTranslations as unknown as readonly Namespace[]),
  ...gamePlayButtonNamespaces,
];

ready(() => {
  const container = document.getElementById("chat-container");
  if (!container) {
    return;
  }

  renderWithErrorBoundary(
    <QueryClientProvider client={queryClient}>
      <TranslationProviderSCC namespaces={translations}>
        <GameCardPlayButtonContext.Provider value={GameCardPlayButton}>
          <App />
        </GameCardPlayButtonContext.Provider>
      </TranslationProviderSCC>
    </QueryClientProvider>,
    container,
    () => {
      trackDotnetAppShellCounter("ChatLoad", { outcome: "loaded" });
    },
    undefined,
    () => {
      trackDotnetAppShellCounter("ChatLoad", { outcome: "crashed" });
    },
  );
});
