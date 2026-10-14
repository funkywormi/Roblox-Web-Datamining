import React from "react";
import { TranslationProvider } from "react-utilities";
import { RelayEnvironmentProvider } from "react-relay";
import { appDownloadNamespaces } from "@rbx/app-download";
import { TranslationProviderSCC } from "@rbx/www-common/i18n/scc";
import ReduxStoreProvider from "./components/ReduxStoreProvider";
import { accountSettingstranslationConfig } from "../../userSettings/translation.config";
import { RelayEnvironment } from "../RelayEnvironment";

/**
 * Wraps the provided ReactNode with ReduxStore, Relay, and Translations.
 * The SDUI settings page can render app-download's buttons, which read use-intl.
 */
const Providers = ({ children }: { children: React.ReactNode }): JSX.Element => {
  return (
    <ReduxStoreProvider>
      <RelayEnvironmentProvider environment={RelayEnvironment}>
        <TranslationProvider config={accountSettingstranslationConfig}>
          <TranslationProviderSCC namespaces={appDownloadNamespaces}>
            {children}
          </TranslationProviderSCC>
        </TranslationProvider>
      </RelayEnvironmentProvider>
    </ReduxStoreProvider>
  );
};

export default Providers;
