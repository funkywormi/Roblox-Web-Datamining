import { TranslationProvider } from "@rbx/core-scripts/react";
import AvatarPage from "../components/AvatarPage";
import { SystemFeedbackProvider } from "../contexts/SystemFeedbackContext";
import { AvatarTabsProvider } from "../contexts/AvatarTabsContext";
import { AssetManagerProvider } from "../contexts/AssetManagerContext";
import { translations } from "../../component.json";
import { CurrentlyWearingAssetsStoreProvider } from "../contexts/CurrentlyWearingAssetsStoreContext";
import { AvatarPageProvider } from "../contexts/AvatarPageContext";
import ErrorBoundary from "./ErrorBoundary";
import { AvatarBodyColorsProvider } from "../contexts/AvatarBodyColorsContext";
import { AvatarEditingAccessProvider } from "../contexts/AvatarEditingAccessContext";

function AvatarPageWithProviders(): JSX.Element {
  return (
    <SystemFeedbackProvider>
      <AvatarEditingAccessProvider>
        <AvatarTabsProvider>
          <AvatarBodyColorsProvider>
            <CurrentlyWearingAssetsStoreProvider>
              <AvatarPageProvider>
                <AssetManagerProvider>
                  <AvatarPage />
                </AssetManagerProvider>
              </AvatarPageProvider>
            </CurrentlyWearingAssetsStoreProvider>
          </AvatarBodyColorsProvider>
        </AvatarTabsProvider>
      </AvatarEditingAccessProvider>
    </SystemFeedbackProvider>
  );
}

function AvatarPageContainer(): JSX.Element {
  return (
    <ErrorBoundary containerName="AvatarPageContainer">
      <TranslationProvider config={translations}>
        <AvatarPageWithProviders />
      </TranslationProvider>
    </ErrorBoundary>
  );
}

export default AvatarPageContainer;
