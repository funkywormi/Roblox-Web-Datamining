import { useEffect, useState } from "react";
import { useRelayEnvironment } from "react-relay";
import {
  createOperationDescriptor,
  fetchQuery,
  getSingularSelector,
  type Disposable,
  type Snapshot,
} from "relay-runtime";
import SettingsSurfaceQueryNode, {
  type SettingsSurfaceQuery,
  type SettingsSurfaceQuery$data,
} from "../../../../settingsSurface/__generated__/SettingsSurfaceQuery.graphql";
import SettingsSurfaceFragmentNode from "../../../../settingsSurface/__generated__/SettingsSurfaceFragment.graphql";
import { TChildInfo } from "../../../../../types/childrenInfoTypes";
import { childManageRecommendationsSurfaceKey } from "./ChildManageRecommendations";

/**
 * Whether the child's Manage Recommendations page has any settings for the parent, which
 * user-settings returns only when the parent manages them for the child. False until they load.
 *
 * It sends the page's own query and keeps the answer in the store while mounted, so the page
 * renders from it without waiting. It reads the answer from the store, so the page's own retries
 * update it too, and sends the query again when the child's info changes (e.g. a new birthdate),
 * which can change what the parent manages.
 */
const useHasChildManageRecommendations = (child: TChildInfo): boolean => {
  const environment = useRelayEnvironment();
  const [hasSettings, setHasSettings] = useState(false);
  const childUserId = child.userId;

  useEffect(() => {
    const variables = {
      userId: String(childUserId),
      surface: childManageRecommendationsSurfaceKey,
    };
    const operation = createOperationDescriptor(SettingsSurfaceQueryNode, variables);
    const retained = environment.retain(operation);
    // The settings are in the surface's fragment, which changes without the query's root (e.g.
    // when a refetch empties them), so both are watched.
    let surfaceSubscription: Disposable | undefined;
    const readSurface = (snapshot: Snapshot) => {
      const { settings } = snapshot.data;
      // The same check as the page, which leaves when it has no settings.
      setHasSettings(Array.isArray(settings) && settings.some(setting => setting != null));
    };
    const read = (snapshot: Snapshot) => {
      if (snapshot.isMissingData) {
        return;
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- the query's own root
      const data = snapshot.data as SettingsSurfaceQuery$data;
      const surface = data.userById?.settings?.surface;
      surfaceSubscription?.dispose();
      surfaceSubscription = undefined;
      if (!surface) {
        setHasSettings(false);
        return;
      }
      const surfaceSnapshot = environment.lookup(
        getSingularSelector(SettingsSurfaceFragmentNode, surface),
      );
      surfaceSubscription = environment.subscribe(surfaceSnapshot, readSurface);
      readSurface(surfaceSnapshot);
    };
    const rootSnapshot = environment.lookup(operation.fragment);
    const stored = environment.subscribe(rootSnapshot, read);
    // An answer already in the store, e.g. from before parental controls was last opened.
    read(rootSnapshot);
    const subscription = fetchQuery<SettingsSurfaceQuery>(
      environment,
      SettingsSurfaceQueryNode,
      variables,
    ).subscribe({
      next: () => read(environment.lookup(operation.fragment)),
      // The page shows its own error and retry.
      error: () => undefined,
    });

    return () => {
      subscription.unsubscribe();
      stored.dispose();
      surfaceSubscription?.dispose();
      retained.dispose();
    };
    // `child` is from the children-info query, whose objects only change with their data.
  }, [environment, childUserId, child]);

  return hasSettings;
};

export default useHasChildManageRecommendations;
