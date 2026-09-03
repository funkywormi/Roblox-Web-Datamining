import React from "react";
import { TranslationProvider } from "react-utilities";
import { RelayEnvironmentProvider } from "react-relay";
import ReduxStoreProvider from "./components/ReduxStoreProvider";
import { accountSettingstranslationConfig } from "../../userSettings/translation.config";
import { RelayEnvironment } from "../RelayEnvironment";

/**
 * Wraps the provided ReactNode with ReduxStore, Relay, and Translations.
 */
const Providers = ({ children }: { children: React.ReactNode }): JSX.Element => {
  return (
    <ReduxStoreProvider>
      <RelayEnvironmentProvider environment={RelayEnvironment}>
        <TranslationProvider config={accountSettingstranslationConfig}>
          {children}
        </TranslationProvider>
      </RelayEnvironmentProvider>
    </ReduxStoreProvider>
  );
};

export default Providers;
