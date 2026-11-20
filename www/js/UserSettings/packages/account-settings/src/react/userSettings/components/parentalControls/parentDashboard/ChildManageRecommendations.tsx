import { useCallback, useRef } from "react";
import { useRelayEnvironment } from "react-relay";
import { commitLocalUpdate, createOperationDescriptor, fetchQuery } from "relay-runtime";
import { useTranslation } from "react-utilities";
import { UserSetting, useSnackbar } from "@rbx/user-settings";
import { TChildInfo } from "../../../../../types/childrenInfoTypes";
import { useUpdateUserSettingValueV2Mutation } from "../../../../apis/userSettingsApi";
import {
  SettingSaveContext,
  type TSaveSetting,
} from "../../../../settingsSurface/SettingSaveContext";
import SettingsSurfaceQueryNode, {
  type SettingsSurfaceKey,
  type SettingsSurfaceQuery,
} from "../../../../settingsSurface/__generated__/SettingsSurfaceQuery.graphql";
import { getLinkedChildDetailsPath } from "../../../constants/parentalControls/parentalControlsConstants";
import commonTranslationConstants from "../../../constants/contentConstants/commonTranslationConstants";
import { handleChildSettingsUpdateError } from "../../../utils/successMessageUtils";
import ManageRecommendationsLoader from "../../manageRecommendations/ManageRecommendationsLoader";

/**
 * The surface a parent sees for their child. It's read as Parent: only a linked parent of the
 * child (or the child with an on-device parent) may query it, its copy says "your child", and
 * user-settings returns the settings only when the parent manages them for the child
 * (`CanParentManageChildsPersonalizedRecommendationsSettings`).
 */
export const childManageRecommendationsSurfaceKey: SettingsSurfaceKey =
  "ManageRecommendationsParentPage";

/**
 * The user-settings API name of a surface setting, e.g. `PersonalizedRecommendationsGameSearch`
 * → `personalizedRecommendationsGameSearch`. Surface setting names are otherwise opaque, but
 * grant-consent takes user-settings names (user-settings#1877, UserSettingsModels 1.37.0, as
 * consumed by parental-controls#1017), which are the same with a lowercase first letter. They
 * aren't in the `UserSetting` enum, so this is the one place that casts to it.
 */
export const toUserSettingName = (surfaceSettingName: string): UserSetting =>
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- see above
  `${surfaceSettingName.charAt(0).toLowerCase()}${surfaceSettingName.slice(1)}` as UserSetting;

/**
 * Saves a child's setting through parental controls' grant-consent, which answers without the
 * settings. So the row shows the new value at once, goes back on failure, and the surface is
 * refetched (`surfaceKey`) after a save to pick up settings the change cascaded to.
 *
 * The new value is an optimistic update, which stays on top of server data until a refetch sent
 * after this save is done. Another row's refetch, which still has the old value while this save is
 * in flight, doesn't flip this row back.
 *
 * The refetches run one at a time. Relay's `fetchQuery` dedupes a request already in flight with
 * the same variables, even with `network-only`, so a refetch started while another is pending (an
 * earlier save's, or the page's own background load) would get that answer, sent before this save.
 * So each refetch first waits for any request in flight for the surface, then sends its own, and
 * the answers can't land out of order.
 *
 * The save settles once grant-consent answers, so a slow refetch doesn't stop the row from being
 * changed again.
 */
const useSaveChildSetting = (child: TChildInfo, surfaceKey: SettingsSurfaceKey): TSaveSetting => {
  const environment = useRelayEnvironment();
  const { translate } = useTranslation();
  const { snackbarService } = useSnackbar();
  const [updateChildSetting] = useUpdateUserSettingValueV2Mutation();
  // The last queued refetch. It never rejects, so the queue goes on after a failed one.
  const lastRefetch = useRef<Promise<unknown>>(Promise.resolve());

  return useCallback<TSaveSetting>(
    async ({ id, name, option, enabled }) => {
      const setting = toUserSettingName(name);
      const shown = environment.applyUpdate({
        storeUpdater: store => {
          store.get(id)?.setValue(enabled, "enabled");
        },
      });

      try {
        await updateChildSetting({ childUserId: child.userId, setting, value: option }).unwrap();
      } catch (error) {
        // Back to the value the store had from the server.
        shown.dispose();
        // Null when it's sent the parent to verify themselves.
        const errorKey = handleChildSettingsUpdateError(error, child.userId, setting);
        if (errorKey) {
          snackbarService.warning(translate(errorKey));
        }
        return;
      }
      snackbarService.success(translate(commonTranslationConstants.successDialogMessage));

      const variables = { userId: String(child.userId), surface: surfaceKey };
      const { request } = createOperationDescriptor(SettingsSurfaceQueryNode, variables);
      const refetchSurface = () =>
        fetchQuery<SettingsSurfaceQuery>(environment, SettingsSurfaceQueryNode, variables, {
          fetchPolicy: "network-only",
        }).toPromise();
      const refetch = lastRefetch.current
        // A load already in flight was sent before this save: `fetchQuery` joins it, so let it
        // land (whatever its outcome), then send this save's own.
        .then(() =>
          environment.isRequestActive(request.identifier)
            ? refetchSurface().catch(() => undefined)
            : undefined,
        )
        .then(refetchSurface);
      lastRefetch.current = refetch
        .catch(() => {
          // Saved: keep showing the chosen value. Other settings it changed show on the next load.
          commitLocalUpdate(environment, store => {
            store.get(id)?.setValue(enabled, "enabled");
          });
        })
        .finally(() => {
          // The refetch (or the local value) has it now.
          shown.dispose();
        });
    },
    [environment, translate, snackbarService, updateChildSetting, child.userId, surfaceKey],
  );
};

/**
 * The Manage Recommendations (VLOP) settings for a linked child, on the parent dashboard: the
 * parent surface (`childManageRecommendationsSurfaceKey`), queried for the child. Changes are saved
 * through parental controls (grant-consent), as for the child's other settings, since
 * `updateUserSetting` only writes the caller's own settings.
 */
const ChildManageRecommendations = ({ child }: { child: TChildInfo }): React.JSX.Element => {
  const saveSetting = useSaveChildSetting(child, childManageRecommendationsSurfaceKey);
  return (
    <SettingSaveContext.Provider value={saveSetting}>
      <ManageRecommendationsLoader
        surfaceKey={childManageRecommendationsSurfaceKey}
        userId={String(child.userId)}
        // The page header (BackLink) already shows the title.
        hideTitle
        emptyRedirectPath={getLinkedChildDetailsPath(child.userId)}
      />
    </SettingSaveContext.Provider>
  );
};

export default ChildManageRecommendations;
