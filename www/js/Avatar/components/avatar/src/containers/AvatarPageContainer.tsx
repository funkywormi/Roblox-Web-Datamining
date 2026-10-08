import type React from "react";
import AvatarPage from "../components/AvatarPage";
import { SystemFeedbackProvider } from "../contexts/SystemFeedbackContext";
import { AvatarTabsProvider } from "../contexts/AvatarTabsContext";
import { AssetManagerProvider } from "../contexts/AssetManagerContext";
import { CurrentlyWearingAssetsStoreProvider } from "../contexts/CurrentlyWearingAssetsStoreContext";
import { AvatarPageProvider } from "../contexts/AvatarPageContext";
import ErrorBoundary from "./ErrorBoundary";
import { AvatarBodyColorsProvider } from "../contexts/AvatarBodyColorsContext";
import { AvatarEditingAccessProvider } from "../contexts/AvatarEditingAccessContext";

function AvatarPageWithProviders(): React.ReactElement {
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

function AvatarPageContainer(): React.ReactElement {
  return (
    <ErrorBoundary containerName="AvatarPageContainer">
      <AvatarPageWithProviders />
    </ErrorBoundary>
  );
}

export default AvatarPageContainer;
