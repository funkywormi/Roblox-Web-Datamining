import { Fragment, JSX } from "react";
import { Link } from "react-router-dom";
import {
  Thumbnail2d,
  ThumbnailFormat,
  ThumbnailTypes,
  ThumbnailGroupIconSize,
} from "roblox-thumbnails";
import { useTranslation } from "@rbx/core-scripts/react";
import { ProgressCircle } from "@rbx/foundation-ui";
import { SettingListItem } from "@rbx/user-settings";
import { BackLink } from "../BackLink";
import translationConstants from "../../constants/translationConstants";
import { useGroupShoutPreferences } from "../../hooks/useGroupShoutPreferences";
import { ROUTES, buildCommunitySettingsPath } from "../../utils/routingUtils";

export const MyCommunitiesPage = (): JSX.Element => {
  const { translate } = useTranslation();
  const { preferences, groups, loading, error } = useGroupShoutPreferences();

  const renderContent = (): JSX.Element => {
    if (loading) {
      return <ProgressCircle ariaLabel="Loading" size="Medium" variant="Indeterminate" />;
    }
    if (error) {
      return (
        <p className="text-body-medium">
          {translate(translationConstants.errorLoadingCommunities)}
        </p>
      );
    }
    if (preferences?.parentalControlsEnabled) {
      return (
        <p className="text-body-medium">
          {translate(translationConstants.parentDisabledCommunityNotifications)}
        </p>
      );
    }
    if (!groups || groups.length === 0) {
      return <p className="text-body-medium">{translate(translationConstants.noCommunities)}</p>;
    }
    return (
      <Fragment>
        <p className="text-body-medium">
          {translate(translationConstants.communitySettingsDescription)}
        </p>
        <div className="settings-list">
          {groups.map(group => (
            <Link
              key={group.groupId}
              to={buildCommunitySettingsPath(group.groupId)}
              className="settings-list-link"
            >
              <SettingListItem
                id={`community-${group.groupId}`}
                title={group.groupName}
                description={group.creatorName}
                thumbnail={
                  <Thumbnail2d
                    type={ThumbnailTypes.groupIcon}
                    size={ThumbnailGroupIconSize.size150}
                    targetId={group.groupId}
                    format={ThumbnailFormat.jpeg}
                    altName={group.groupName}
                  />
                }
                showArrow
              />
            </Link>
          ))}
        </div>
      </Fragment>
    );
  };

  return (
    <div className="my-communities-page">
      <BackLink
        currentPagePath={ROUTES.myCommunities}
        titleTranslationKey={translationConstants.myCommunities}
      />
      {renderContent()}
    </div>
  );
};

export default MyCommunitiesPage;
