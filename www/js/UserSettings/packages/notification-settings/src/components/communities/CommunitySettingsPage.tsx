import { JSX } from "react";
import { Redirect, useParams } from "react-router-dom";
import { useFragment } from "react-relay";
import {
  Thumbnail2d,
  ThumbnailFormat,
  ThumbnailTypes,
  ThumbnailGroupIconSize,
} from "roblox-thumbnails";
import { useTranslation } from "@rbx/core-scripts/react";
import { useSnackbar } from "@rbx/user-settings";
import { ProgressCircle } from "@rbx/foundation-ui";
import { BackLink } from "../BackLink";
import type { CategoryPageFragment$key } from "../__generated__/CategoryPageFragment.graphql";
import CategoryPageFragmentNode from "../__generated__/CategoryPageFragment.graphql";
import {
  CATEGORY_KEYS,
  COMMUNITY_PREF_TO_NOTIFICATION_TYPE,
} from "../../constants/notificationConstants";
import translationConstants from "../../constants/translationConstants";
import { useGroupShoutPreferences } from "../../hooks/useGroupShoutPreferences";
import type { CommunityNotificationPreferenceType } from "../../services/groupsService";
import { getCommunityPageUrl } from "../../constants/urlConstants";
import { ROUTES, buildCommunitySettingsPath } from "../../utils/routingUtils";
import { resolveCategoryPresentation } from "../../utils/presentationUtils";
import type { CommunitySettingsParams, NotificationCategory } from "../../types";
import { CommunityNotificationTypeRow } from "./CommunityNotificationTypeRow";

type CommunitySettingsPageProps = {
  categories: readonly NotificationCategory[];
};

export const CommunitySettingsPage = ({ categories }: CommunitySettingsPageProps): JSX.Element => {
  const { groupId } = useParams<CommunitySettingsParams>();
  const { translate } = useTranslation();
  const { snackbarService } = useSnackbar();

  const communitiesRow = categories.find(c => c.category.value === CATEGORY_KEYS.communities);

  const notificationCategory = useFragment<CategoryPageFragment$key>(
    CategoryPageFragmentNode,
    communitiesRow ?? null,
  );

  const communitiesDescriptionKey =
    notificationCategory &&
    resolveCategoryPresentation(notificationCategory.category.value).descriptionTranslationKey;
  const description = communitiesDescriptionKey ? translate(communitiesDescriptionKey) : undefined;

  const { groups, loading, error, updating, setPreference } = useGroupShoutPreferences();

  const group = groups?.find(g => g.groupId === Number(groupId));

  const handleToggle = async (
    groupIdNum: number,
    type: CommunityNotificationPreferenceType,
    enabled: boolean,
  ): Promise<void> => {
    const success = await setPreference(groupIdNum, type, enabled);

    if (success) {
      snackbarService.success(translate(translationConstants.savedSuccessfully));
    } else {
      snackbarService.warning(translate(translationConstants.unknownError));
    }
  };

  if (loading) {
    return (
      <div className="community-settings-page">
        <ProgressCircle ariaLabel="Loading" size="Medium" variant="Indeterminate" />
      </div>
    );
  }

  if (error || !groups || !group) {
    return <Redirect to={ROUTES.myCommunities} />;
  }

  return (
    <div className="community-settings-page">
      <BackLink
        currentPagePath={buildCommunitySettingsPath(group.groupId)}
        title={group.groupName}
      />
      <p className="text-body-medium">{description}</p>
      <a
        href={getCommunityPageUrl(group.groupId)}
        className="settings-list-item-container margin-bottom-medium"
        aria-label={group.groupName}
      >
        <div className="flex gap-small">
          <div className="settings-list-item-thumbnail size-[50px] shrink-0 clip radius-small flex items-center justify-center">
            <Thumbnail2d
              type={ThumbnailTypes.groupIcon}
              size={ThumbnailGroupIconSize.size150}
              targetId={group.groupId}
              format={ThumbnailFormat.jpeg}
              altName={group.groupName}
            />
          </div>
          <div className="settings-list-item-info">
            <span className="setting-name font-body">{group.groupName}</span>
            <span className="small text">{group.creatorName}</span>
          </div>
        </div>
      </a>

      <div className="settings-list">
        {group.notificationPreferences.map(pref => {
          const toggleId = `toggle-${group.groupId}-${pref.type}`;
          const globalValue = COMMUNITY_PREF_TO_NOTIFICATION_TYPE[pref.type];
          const globalNotificationType = notificationCategory?.notificationTypes.find(
            nt => nt.notificationType.value === globalValue,
          );

          return (
            <CommunityNotificationTypeRow
              key={pref.type}
              pref={pref}
              toggleId={toggleId}
              globalNotificationType={globalNotificationType}
              updating={updating}
              onToggle={() => {
                handleToggle(group.groupId, pref.type, !pref.enabled).catch(() => undefined);
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default CommunitySettingsPage;
