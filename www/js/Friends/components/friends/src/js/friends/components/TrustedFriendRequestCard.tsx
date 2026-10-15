import React, { Fragment, useMemo } from "react";
import { withTranslations } from "react-utilities";
import { AvatarCardItem, Button, Tooltip } from "react-style-guide";
import Presence from "@rbx/presence";
import { Thumbnail2d, ThumbnailTypes, DefaultThumbnailSize } from "@rbx/thumbnails";
import { useUserProfiles } from "@rbx/www-common/user-profiles";
import { usePlusStatus } from "@rbx/identity-badges";
import { getMutualFriendDisplayNames, useMultiProfileInsights } from "@rbx/friends-common";
import friendsConstants from "../constants/friendsConstants";
import urlConstants from "../constants/urlConstants";
import translationConfig from "../translation.config";
import FriendCardFooter from "./FriendCardFooter";

const { MUTUAL_FRIENDS_SHOW_COUNT, PLUS_SIGN } = friendsConstants;

const PROFILE_FIELDS = ["names.combinedName", "names.username", "isVerified"] as const;

type TranslateFn = (key: string, params?: Record<string, string | number>) => string;

type TrustedFriendRequestCardProps = {
  senderId: number;
  onAccept: (senderId: number) => void;
  onIgnore: (senderId: number) => void;
  isIgnoring: boolean;
  isDisabled: boolean;
  translate: TranslateFn;
};

const TrustedFriendRequestCard = ({
  senderId,
  onAccept,
  onIgnore,
  isIgnoring,
  isDisabled,
  translate,
}: TrustedFriendRequestCardProps): React.JSX.Element => {
  const profileUrl = urlConstants.getUserProfileUrl(senderId);
  // Stable id list so profile/plus/insights hooks do not see a new array every render.
  const senderIds = useMemo(() => [senderId], [senderId]);

  const { data: profilesByUserId, isLoading: areProfilesLoading } = useUserProfiles(
    senderIds,
    PROFILE_FIELDS,
  );
  const { data: plusStatusByUserId } = usePlusStatus(senderIds);
  const { data: insightsByUserId } = useMultiProfileInsights(senderIds);

  // get-profiles returns top-level `isVerified`; www-common's UserProfile type omits it today.
  const profile = profilesByUserId[senderId] as
    | {
        names?: { username?: string | null; combinedName?: string | null } | null;
        isVerified?: boolean;
      }
    | undefined;
  const username = profile?.names?.username ?? "";
  const displayName = profile?.names?.combinedName ?? "";
  const hasVerifiedBadge = profile?.isVerified === true;
  const isRobloxPlus = plusStatusByUserId[senderId] === true;
  const senderInsights = insightsByUserId[senderId];
  const mutualFriends = useMemo(
    () => getMutualFriendDisplayNames(senderInsights),
    [senderInsights],
  );
  const profileUnavailable = areProfilesLoading || profile == null;
  const cardDisabled = isDisabled || profileUnavailable;

  const thumbnail = (
    <Thumbnail2d
      type={ThumbnailTypes.avatarHeadshot}
      size={DefaultThumbnailSize}
      targetId={senderId}
      includeProfileFrame
      containerClass="avatar-card-image"
    />
  );

  const mutualFriendsFooter =
    mutualFriends.length > 0 ? (
      <Tooltip
        id={`trusted-friend-request-mutuals-${senderId}`}
        placement="bottom"
        content={
          <Fragment>
            {mutualFriends.slice(0, MUTUAL_FRIENDS_SHOW_COUNT).map(mutualFriend => (
              <li key={mutualFriend} className="text-overflow">
                {mutualFriend}
              </li>
            ))}
            {mutualFriends.length > MUTUAL_FRIENDS_SHOW_COUNT ? (
              <li className="text-overflow">
                {translate("Message.More", {
                  plusSign: PLUS_SIGN,
                  remainingCount: mutualFriends.length - MUTUAL_FRIENDS_SHOW_COUNT,
                })}
              </li>
            ) : null}
          </Fragment>
        }
      >
        <span className="mutual-friends-tooltip-label">
          {translate("Label.WebMutualFriend", {
            mutualConnectionsCount: mutualFriends.length,
          })}
        </span>
      </Tooltip>
    ) : null;

  return (
    <AvatarCardItem.Default
      id={senderId}
      disableCard={cardDisabled}
      data-testid="trusted-friend-request-card"
    >
      <AvatarCardItem.Content>
        <AvatarCardItem.Headshot
          imageLink={profileUrl}
          statusIcon={<Presence.PresenceStatusIcon translate={translate} userId={senderId} />}
          thumbnail={thumbnail}
        />
        <AvatarCardItem.Caption
          name={username}
          displayName={displayName}
          nameLink={profileUrl}
          footer={
            mutualFriendsFooter ? <FriendCardFooter>{mutualFriendsFooter}</FriendCardFooter> : null
          }
          verifiedBadgeData={{ hasVerifiedBadge }}
          isRobloxPlus={isRobloxPlus}
        />
      </AvatarCardItem.Content>
      <AvatarCardItem.ButtonGroup>
        <Button
          isLoading={isIgnoring}
          className="ignore-friend"
          onClick={() => {
            if (cardDisabled) {
              return;
            }
            onIgnore(senderId);
          }}
          variant="secondary"
          size="md"
          data-testid="trusted-friend-request-ignore"
        >
          {translate("Action.Ignore")}
        </Button>
        <Button
          isLoading={isIgnoring}
          className="accept-friend"
          onClick={() => {
            if (cardDisabled) {
              return;
            }
            onAccept(senderId);
          }}
          variant="cta"
          size="md"
          data-testid="trusted-friend-request-accept"
        >
          {translate("Action.Accept")}
        </Button>
      </AvatarCardItem.ButtonGroup>
    </AvatarCardItem.Default>
  );
};

// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- withTranslations injects translate; public props omit it
export default withTranslations(
  TrustedFriendRequestCard,
  translationConfig,
) as unknown as React.ComponentType<Omit<TrustedFriendRequestCardProps, "translate">>;
