import { useEffect } from "react";
import { Redirect } from "react-router-dom";
import { useFragment, useLazyLoadQuery } from "react-relay";
import SettingsSurfaceQueryNode, {
  type SettingsSurfaceKey,
  type SettingsSurfaceQuery,
} from "../../../settingsSurface/__generated__/SettingsSurfaceQuery.graphql";
import SettingsSurfaceFragmentNode, {
  type SettingsSurfaceFragment$key,
} from "../../../settingsSurface/__generated__/SettingsSurfaceFragment.graphql";
import { SettingsSurface } from "../../../settingsSurface/SettingsSurface";
import {
  fireSettingsSurfaceIssueCounter,
  type SettingsSurfaceIssue,
} from "./manageRecommendationsCounters";
import RouterPath from "../../../../enums/RouterPath";
import { SettingsSurfaceError } from "../../../settingsSurface/SettingsSurfaceError";

/** The surface the user's own Manage Recommendations tab shows. */
export const manageRecommendationsSurfaceKey: SettingsSurfaceKey = "ManageRecommendationsPage";

type TPageProps = {
  /** The surface to show. A host picks its own, e.g. for parent-facing copy. */
  surfaceKey: SettingsSurfaceKey;
  userId: string;
  onRetry: () => void;
};

const useIssueCounter = (surfaceKey: SettingsSurfaceKey, issue: SettingsSurfaceIssue | null) => {
  useEffect(() => {
    if (issue) {
      fireSettingsSurfaceIssueCounter(surfaceKey, issue);
    }
  }, [surfaceKey, issue]);
};

/**
 * Decides what the page shows for a loaded surface. The page needs more than `SettingsSurface`,
 * which renders nothing when it can't render: the intro is legally required, so missing copy is
 * an error, and a surface with no settings for this user sends them to the default tab.
 */
const ManageRecommendationsSurface = ({
  surface: surfaceRef,
  surfaceKey,
  userId,
  onRetry,
}: TPageProps & { surface: SettingsSurfaceFragment$key }): React.JSX.Element => {
  const data = useFragment<SettingsSurfaceFragment$key>(SettingsSurfaceFragmentNode, surfaceRef);
  const { presentation } = data.header;
  const hasCopy = Boolean(presentation?.label && presentation.description?.text);
  useIssueCounter(surfaceKey, hasCopy ? null : "SurfaceWithoutPresentation");

  if (!hasCopy) {
    return (
      <SettingsSurfaceError
        className="settings-container-v2 padding-bottom-large"
        onRetry={onRetry}
      />
    );
  }
  if (!data.settings.some(setting => setting != null)) {
    // Ineligible, or the surface is switched off.
    return <Redirect to={`/${RouterPath.Info}`} />;
  }
  return (
    <section className="settings-container-v2" data-testid="manage-recommendations-page">
      <SettingsSurface surface={surfaceRef} userId={userId} />
    </section>
  );
};

/**
 * Loads the surface `surfaceKey` with the shared `SettingsSurfaceQuery` and renders
 * it with `SettingsSurface`. Suspends while loading and throws if the query fails, so render it
 * inside Suspense and an error boundary (see `ManageRecommendationsLoader`).
 */
const ManageRecommendationsPage = ({
  surfaceKey,
  userId,
  fetchKey,
  onRetry,
}: TPageProps & { fetchKey: number }): React.JSX.Element => {
  const data = useLazyLoadQuery<SettingsSurfaceQuery>(
    SettingsSurfaceQueryNode,
    { userId, surface: surfaceKey },
    // A retry must not show the cached response it's retrying, so it waits for the network.
    { fetchKey, fetchPolicy: fetchKey > 0 ? "network-only" : "store-and-network" },
  );
  const surface = data.userById?.settings?.surface;
  useIssueCounter(surfaceKey, surface ? null : "SurfaceNull");

  if (!surface) {
    return (
      <SettingsSurfaceError
        className="settings-container-v2 padding-bottom-large"
        onRetry={onRetry}
      />
    );
  }
  return (
    <ManageRecommendationsSurface
      surface={surface}
      surfaceKey={surfaceKey}
      userId={userId}
      onRetry={onRetry}
    />
  );
};

export default ManageRecommendationsPage;
