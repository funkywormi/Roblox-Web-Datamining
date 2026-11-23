import { document } from "@rbx/core-lib/browser";
import ready from "@rbx/core-scripts/util/ready";
import { renderWithErrorBoundary } from "@rbx/core-scripts/react";
import type { Namespace } from "@rbx/www-common/i18n";
import { TranslationProviderSCC } from "@rbx/www-common/i18n/scc";
import App from "./src/App";
import { translations } from "./component.json";
import "./src/main.css";

ready(() => {
  const container = document?.getElementById("inventory-container");
  if (!container) {
    return;
  }
  const canViewInventory =
    container.querySelector("inventory")?.getAttribute("can-view-inventory") ?? undefined;

  renderWithErrorBoundary(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- CI narrows Namespace; component.json is always valid
    <TranslationProviderSCC namespaces={translations as unknown as readonly Namespace[]}>
      <App canViewInventory={canViewInventory} />
    </TranslationProviderSCC>,
    container,
  );
});
