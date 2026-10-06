import { QueryClientProvider } from "@tanstack/react-query";
import ready from "@rbx/core-scripts/util/ready";
import { queryClient, renderWithErrorBoundary } from "@rbx/core-scripts/react";
import { TranslationProviderSCC } from "@rbx/www-common/i18n/scc";
import type { Namespace } from "@rbx/www-common/i18n";
import App from "./src/App";
import { translations as rawTranslations } from "./component.json";
import "./src/main.scss";

// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- CI narrows Namespace; component.json is always valid
const translations = rawTranslations as unknown as readonly Namespace[];

ready(() => {
  const container = document.getElementById("chat-container");
  if (!container) {
    return;
  }

  renderWithErrorBoundary(
    <QueryClientProvider client={queryClient}>
      <TranslationProviderSCC namespaces={translations}>
        <App />
      </TranslationProviderSCC>
    </QueryClientProvider>,
    container,
  );
});
