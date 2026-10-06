import dataStores from "@rbx/core-scripts/data-store";
import { renderWithErrorBoundary, TranslationProvider } from "@rbx/core-scripts/react";
import ready from "@rbx/core-scripts/util/ready";
import { registerReferrerLookup } from "@rbx/subscriptions-common";
import { TranslationProviderSCC } from "@rbx/www-common/i18n/scc";

import { translations } from "./component.json";
import App from "./src/App";
import "./src/main.css";
import ErrorView from "./src/components/ErrorView";
import ViewContainer from "./src/components/ViewContainer";

import type { Namespace } from "@rbx/www-common/i18n";

registerReferrerLookup(referrerId => dataStores.userDataStore.getUser(referrerId));

// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- CI narrows Namespace; component.json is always valid
const namespaces = translations as unknown as readonly Namespace[];

ready(() => {
  renderWithErrorBoundary(
    <TranslationProviderSCC namespaces={namespaces}>
      <TranslationProvider config={translations}>
        <App />
      </TranslationProvider>
    </TranslationProviderSCC>,
    document.getElementById("roblox-subscription-container"),
    undefined,
    <ViewContainer>
      <ErrorView />
    </ViewContainer>,
  );
});
