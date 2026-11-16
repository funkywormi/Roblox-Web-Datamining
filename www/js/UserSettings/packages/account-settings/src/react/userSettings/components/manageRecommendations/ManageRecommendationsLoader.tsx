import { Suspense, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Loading } from "react-style-guide";
import ManageRecommendationsPage from "./ManageRecommendationsPage";
import { SettingsSurfaceError } from "../../../settingsSurface/SettingsSurfaceError";
import { fireSettingsSurfaceIssueCounter } from "./manageRecommendationsCounters";
import type { SettingsSurfaceKey } from "../../../settingsSurface/__generated__/SettingsSurfaceQuery.graphql";

/**
 * Loads the page for a user and surface, with the loading, error and retry states around it. Its
 * strings use the legacy `useTranslation`, so render it inside the account settings
 * `TranslationProvider`.
 */
const ManageRecommendationsLoader = ({
  surfaceKey,
  userId,
}: {
  /** The surface to show, e.g. `manageRecommendationsSurfaceKey` on the user's own tab. */
  surfaceKey: SettingsSurfaceKey;
  userId: string;
}): React.JSX.Element => {
  const [fetchKey, setFetchKey] = useState(0);
  const retry = () => setFetchKey(key => key + 1);

  return (
    // Catches a failed SettingsSurfaceQuery (thrown by `useLazyLoadQuery`). A retry bumps fetchKey,
    // which clears the boundary's error (resetKeys), remounts the page so it reports again (key)
    // and refetches. Another surface or user clears it too, so a host can reuse the loader.
    <ErrorBoundary
      resetKeys={[fetchKey, surfaceKey, userId]}
      onError={error => fireSettingsSurfaceIssueCounter(surfaceKey, "LoadFailed", error.name)}
      fallback={
        <SettingsSurfaceError
          className="settings-container-v2 padding-bottom-large"
          onRetry={retry}
        />
      }
    >
      {/* The app's usual page spinner, like the other account settings pages. */}
      <Suspense key={fetchKey} fallback={<Loading />}>
        <ManageRecommendationsPage
          surfaceKey={surfaceKey}
          userId={userId}
          fetchKey={fetchKey}
          onRetry={retry}
        />
      </Suspense>
    </ErrorBoundary>
  );
};

export default ManageRecommendationsLoader;
