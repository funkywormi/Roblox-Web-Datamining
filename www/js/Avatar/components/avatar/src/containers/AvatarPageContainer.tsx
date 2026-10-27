import type React from "react";
import { useEffect } from "react";
import { UniversalFeatureRestrictionsProvider } from "@rbx/universal-feature-restrictions";
import AvatarPage from "../components/AvatarPage";
import UniversalFeatureRestrictionsSurface from "../components/UniversalFeatureRestrictionsSurface";
import { SystemFeedbackProvider } from "../contexts/SystemFeedbackContext";
import { AvatarTabsProvider } from "../contexts/AvatarTabsContext";
import { AssetManagerProvider } from "../contexts/AssetManagerContext";
import { CurrentlyWearingAssetsStoreProvider } from "../contexts/CurrentlyWearingAssetsStoreContext";
import { AvatarPageProvider } from "../contexts/AvatarPageContext";
import ErrorBoundary from "./ErrorBoundary";
import { AvatarBodyColorsProvider } from "../contexts/AvatarBodyColorsContext";
import { AvatarEditingAccessProvider } from "../contexts/AvatarEditingAccessContext";
import { prefetchAnimationItemCardHoverPreviewIxp } from "../hooks/useAnimationItemCardHoverPreviewIxp";

function AvatarPageWithProviders(): React.ReactElement {
  // Warm IXP before item cards mount so the first hover is not racing enrollment.
  useEffect(() => {
    // eslint-disable-next-line @rbx/promises/prefer-query-mutation, no-void -- fire-and-forget warm
    void prefetchAnimationItemCardHoverPreviewIxp();
  }, []);

  return (
    <UniversalFeatureRestrictionsProvider Surface={UniversalFeatureRestrictionsSurface}>
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
    </UniversalFeatureRestrictionsProvider>
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
