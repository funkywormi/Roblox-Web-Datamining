import React, { useCallback, useMemo, memo } from "react";
import { Component, TrustedFriendStatus } from "@rbx/profile-platform";
import { entityUrl } from "@rbx/core-scripts/legacy/core-roblox-utilities";
import { Thumbnail2d, ThumbnailTypes, ThumbnailAvatarHeadshotSize } from "@rbx/thumbnails";
import { AvatarCardItem } from "@rbx/core-ui";
import { useTranslation } from "@rbx/core-scripts/react";
import { useProfilePlatformContext } from "../context/ProfilePlatformContext";
import useProfileJsonComponent from "../hooks/useProfileJsonComponent";
import ProfileHeaderTitleContainer from "./ProfileHeaderTitleContainer";

interface PresenceData {
  userPresenceType: number;
  rootPlaceId: number | null;
}

interface PresenceService {
  usePresence: (userId: number, options?: unknown) => PresenceData;
  PresenceType: {
    Game: number;
  };
  PresenceStatusIcon: (props: { userId: number }) => React.JSX.Element;
}

declare const RobloxPresence: PresenceService;

const usePresenceData = (userId: number) => {
  const presence = RobloxPresence.usePresence(userId, undefined);

  const generateReferralLinkToExperience = useCallback(
    (experienceId: number) => entityUrl.game.getRelativePath(experienceId),
    [],
  );

  const presenceUrl = useMemo(
    () =>
      presence.userPresenceType === RobloxPresence.PresenceType.Game && presence.rootPlaceId
        ? generateReferralLinkToExperience(presence.rootPlaceId)
        : undefined,
    [presence.userPresenceType, presence.rootPlaceId, generateReferralLinkToExperience],
  );

  return useMemo(
    () => ({
      userPresenceType: presence.userPresenceType,
      rootPlaceId: presence.rootPlaceId,
      presenceUrl,
    }),
    [presence.userPresenceType, presence.rootPlaceId, presenceUrl],
  );
};

const PresenceStatusIcon = ({ userId }: { userId: number }) => (
  <RobloxPresence.PresenceStatusIcon userId={userId} />
);

const ProfileHeaderDetails: React.FC = () => {
  const { profileId } = useProfilePlatformContext();
  const userProfileHeaderData = useProfileJsonComponent(Component.UserProfileHeader);
  const username = userProfileHeaderData?.names.username;
  const profileUserId = parseInt(profileId, 10);
  const presenceData = usePresenceData(profileUserId);
  const isTrustedConnection =
    userProfileHeaderData?.viewerRelationship.trustedFriendStatus ===
    TrustedFriendStatus.TrustedFriends;
  const { translate } = useTranslation();
  const trustedText = translate("TrustedConnection.Label.Trusted");
  const trustedLabel = `  • ${trustedText}`;

  return (
    <div className="flex gap-medium items-center min-width-0">
      <div className="user-profile-header-details-avatar-container avatar-headshot-lg">
        <AvatarCardItem.Headshot
          thumbnail={
            <Thumbnail2d
              containerClass="avatar-card-image"
              targetId={profileUserId}
              type={ThumbnailTypes.avatarHeadshot}
              altName={userProfileHeaderData?.names.primaryName ?? ""}
              size={ThumbnailAvatarHeadshotSize.size150}
              includeProfileFrame
            />
          }
          statusIcon={<PresenceStatusIcon userId={profileUserId} />}
          statusLink={presenceData.presenceUrl}
        />
      </div>

      <div className="flex flex-col min-width-0">
        <ProfileHeaderTitleContainer />
        <div>
          <span className="stylistic-alts-username">{username ? `@${username}` : undefined}</span>
          {isTrustedConnection && <span>{trustedLabel}</span>}
        </div>
      </div>
    </div>
  );
};

export default memo(ProfileHeaderDetails);
