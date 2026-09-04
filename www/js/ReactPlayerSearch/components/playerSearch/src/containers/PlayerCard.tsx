import React from "react";
import classNames from "classnames";
import environmentUrls from "@rbx/environment-urls";
import { useTranslation, type TranslateFunction } from "@rbx/core-scripts/react";
import { Button, StatusIndicator, type TStatusIndicatorColor } from "@rbx/foundation-ui";
import { Thumbnail2d, ThumbnailFormat, ThumbnailTypes } from "@rbx/thumbnails";
import Presence from "@rbx/presence";
import { BadgeSizes, VerifiedBadgeIconContainer } from "@rbx/roblox-badges";
import { DisplayNameBadges, useIsPlusBadgeEnabled } from "@rbx/identity-badges";
import { PLUS_BADGE_ARIA_LABEL, PLUS_BADGE_ARIA_LABEL_KEY } from "@rbx/identity-badges/constants";
import { friendshipStatuses } from "../constants/friendshipStatus";
import { userPresenceTypes } from "../types/extendedUserPresence";
import type { SearchResultUser } from "../types/searchedUser";
import PlayerCardActions from "./PlayerCardActions";

type Translate = TranslateFunction;
const usernamePrefix = "@";

type PlayerCardProps = {
  user: SearchResultUser;
  renameFriendsToConnections: boolean;
  isChatEntrypointEnabled: boolean | null;
  isUserGuest?: boolean;
  isLoading?: boolean;
  /**
   * SUBS-5048: Plus subscriber signal sourced from `usePlusStatus`. Optional
   * so callers that have not yet plumbed the signal stay backwards-compatible.
   */
  isRobloxPlus?: boolean;
  onAcceptFriend: (user: SearchResultUser) => void;
  onAddFriend: (user: SearchResultUser) => void;
  onJoinGame: (user: SearchResultUser) => void;
  onOpenProfile: (user: SearchResultUser) => void;
  onStartChat: (user: SearchResultUser) => void;
};

// Angular pairs two of these labels with a legacy sprite glyph. The sprite image and its light/dark
// variants come from the page's styleGuide sheet; ../main.css restates only the 14px geometry that
// Angular applied through a selector chain this markup does not match.
const relationshipIcon = {
  aka: "player-search-legacy-icon icon-pastname",
  friends: "player-search-legacy-icon icon-nav-friends",
} as const;

const getRelationshipIcon = (user: SearchResultUser): string | null => {
  if (user.isCurrentUser) {
    return null;
  }

  if (user.matchingPreviousName) {
    return relationshipIcon.aka;
  }

  return user.friendshipStatus === friendshipStatuses.friends ? relationshipIcon.friends : null;
};

const getRelationshipText = (
  user: SearchResultUser,
  renameFriendsToConnections: boolean,
  translate: Translate,
): string | null => {
  if (user.isCurrentUser) {
    return translate("Label.ThisIsYou");
  }

  // Label.NewUsername resolves from Roblox.LangDynamic, not Roblox.Lang.
  if (user.matchingPreviousName) {
    return translate("Label.NewUsername", undefined, "New Username");
  }

  if (user.friendshipStatus === friendshipStatuses.friends) {
    return renameFriendsToConnections
      ? translate("Label.YouAreConnections", undefined, "You are connections")
      : translate("Label.YouAreFriends");
  }

  if (user.isFollowing) {
    return translate("Label.YouAreFollowing");
  }

  return null;
};

// playerSearchController's labelToShow only falls through to the presence label when
// `CurrentUser.isAuthenticated`, so a guest gets no label rather than "Offline" on every card.
const shouldShowPresenceStatus = (user: SearchResultUser, isUserGuest: boolean): boolean => {
  return (
    !isUserGuest &&
    !user.isCurrentUser &&
    !user.matchingPreviousName &&
    user.friendshipStatus !== friendshipStatuses.friends &&
    !user.isFollowing
  );
};

// @rbx/presence's presenceStatusLabel keys the label off the presence type, so lastLocation is
// only ever shown for Game/Studio, and only when a rootPlaceId came with it.
const presenceLabelKeys: Record<number, string> = {
  [userPresenceTypes.offline]: "Label.Offline",
  [userPresenceTypes.online]: "Label.Online",
  [userPresenceTypes.invisible]: "Label.Invisible",
};

const stopCardActivation = (event: React.MouseEvent | React.KeyboardEvent): void => {
  event.stopPropagation();
};

const getPresenceText = (user: SearchResultUser, translate: Translate): string => {
  const labelKey = presenceLabelKeys[user.userPresenceType ?? userPresenceTypes.offline];

  if (labelKey) {
    return translate(labelKey);
  }

  const trimmedLastLocation = user.lastLocation?.trim();

  return user.rootPlaceId && trimmedLastLocation ? trimmedLastLocation : translate("Label.Online");
};

const statusIndicatorColors: Record<number, TStatusIndicatorColor | undefined> = {
  [userPresenceTypes.online]: "Emphasis",
  [userPresenceTypes.game]: "Success",
  [userPresenceTypes.studio]: "Warning",
  [userPresenceTypes.invisible]: "Neutral",
};

const PresenceText = ({
  user,
  translate,
  onLinkClick,
}: {
  user: SearchResultUser;
  translate: Translate;
  onLinkClick: (event: React.MouseEvent) => void;
}): React.JSX.Element => {
  const trimmedLastLocation = user.lastLocation?.trim();

  if (user.userPresenceType === userPresenceTypes.game && user.rootPlaceId && trimmedLastLocation) {
    return (
      <a
        className="text-link"
        href={`${environmentUrls.websiteUrl}/games/${user.rootPlaceId}`}
        onClick={onLinkClick}
        title={trimmedLastLocation}
      >
        {trimmedLastLocation}
      </a>
    );
  }

  return <React.Fragment>{getPresenceText(user, translate)}</React.Fragment>;
};

// playerSearchController's getUserInfo: gameIsPlayable and Studio outrank the primary group.
const getGroupName = (user: SearchResultUser): string | undefined => {
  if (user.gameIsPlayable || user.userPresenceType === userPresenceTypes.studio) {
    return undefined;
  }

  return user.primaryGroup?.name;
};

// playerSearchController shows the presence row for its `presence` label, and additionally
// whenever the user is in a game or in Studio, even for a friend.
const shouldShowPresenceRow = (user: SearchResultUser, isUserGuest: boolean): boolean => {
  return (
    shouldShowPresenceStatus(user, isUserGuest) ||
    user.gameIsPlayable ||
    user.userPresenceType === userPresenceTypes.studio
  );
};

const PlayerCard = ({
  user,
  renameFriendsToConnections,
  isChatEntrypointEnabled,
  isUserGuest = false,
  isLoading = false,
  isRobloxPlus,
  onAcceptFriend,
  onAddFriend,
  onJoinGame,
  onOpenProfile,
  onStartChat,
}: PlayerCardProps): React.JSX.Element => {
  const { translate } = useTranslation();
  const relationshipText = getRelationshipText(user, renameFriendsToConnections, translate);
  const relationshipGlyph = getRelationshipIcon(user);
  const groupName = getGroupName(user);
  const selfLabel = translate("Label.ThisIsYou");
  const showPlusBadge = useIsPlusBadgeEnabled() && isRobloxPlus === true;
  const statusIndicatorColor =
    statusIndicatorColors[user.userPresenceType ?? userPresenceTypes.offline];

  return (
    <article
      className={classNames(
        "player-search-card relative flex width-full min-height-2000 flex-col bg-surface-100 radius-medium",
        user.isCurrentUser && "player-search-card-self",
      )}
      data-testid={`player-card-${user.id}`}
    >
      {/* role=button, not <button>: the caption links cannot nest inside one. */}
      <div
        className="player-search-card-body flex width-full grow cursor-pointer items-start gap-large padding-large"
        onClick={() => {
          onOpenProfile(user);
        }}
        onKeyDown={event => {
          if (event.target !== event.currentTarget) {
            return;
          }

          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onOpenProfile(user);
          }
        }}
        role="button"
        tabIndex={0}
      >
        <span className="player-search-avatar shrink-0">
          <span className="player-search-avatar-clip">
            <Thumbnail2d
              altName={user.displayName}
              containerClass="height-full width-full"
              format={ThumbnailFormat.webp}
              imgClassName="height-full width-full object-cover"
              targetId={user.id}
              type={ThumbnailTypes.avatarHeadshot}
            />
          </span>
          {user.isCurrentUser || isUserGuest ? null : (
            <span className="player-search-avatar-status">
              <span className="player-search-avatar-status-wide">
                <Presence.PresenceStatusIcon translate={translate} userId={user.id} />
              </span>
              {statusIndicatorColor ? (
                <span className="player-search-avatar-status-narrow">
                  <StatusIndicator color={statusIndicatorColor} size="XLarge" />
                </span>
              ) : null}
            </span>
          )}
        </span>
        <div className="player-search-card-caption flex flex-col justify-start gap-xsmall">
          <div className="flex min-width-0 items-center gap-small">
            <div
              className={
                user.areNamesLoading
                  ? "player-search-card-name shimmer player-search-name-shimmer"
                  : "player-search-card-name flex items-center gap-xxsmall text-body-large content-emphasis"
              }
            >
              {user.areNamesLoading ? null : (
                <React.Fragment>
                  <span className="min-width-0 text-truncate-end">
                    {user.primaryName ?? user.displayName}
                  </span>
                  {user.hasVerifiedBadge ? (
                    <VerifiedBadgeIconContainer
                      additionalImgClass="player-search-verified-badge"
                      size={BadgeSizes.TITLE}
                    />
                  ) : null}
                  {showPlusBadge ? (
                    <DisplayNameBadges
                      isRobloxPlus
                      size="Small"
                      plusBadgeAriaLabel={translate(
                        PLUS_BADGE_ARIA_LABEL_KEY,
                        undefined,
                        PLUS_BADGE_ARIA_LABEL,
                      )}
                    />
                  ) : null}
                </React.Fragment>
              )}
            </div>
          </div>
          {user.areNamesLoading ? (
            <p className="shimmer player-search-label-shimmer" />
          ) : (
            <p className="text-body-small content-muted">
              {usernamePrefix}
              {user.username ?? user.name}
            </p>
          )}
          {relationshipText ? (
            <p className="flex items-center gap-xsmall text-body-small content-muted">
              {relationshipGlyph ? <span className={relationshipGlyph} /> : null}
              <span className="player-search-card-line">{relationshipText}</span>
            </p>
          ) : null}
          {groupName ? (
            <p className="flex items-center gap-xsmall text-body-small content-muted">
              <span className="player-search-legacy-icon icon-nav-group" />
              <a
                className="player-search-card-line text-link"
                href={user.primaryGroup?.url}
                onClick={stopCardActivation}
                title={groupName}
              >
                {groupName}
              </a>
            </p>
          ) : null}
          {shouldShowPresenceRow(user, isUserGuest) ? (
            <p className="text-body-small content-muted">
              <PresenceText onLinkClick={stopCardActivation} translate={translate} user={user} />
            </p>
          ) : null}
        </div>
      </div>
      {/* Angular's showButtonsForFriends/showButtonsForNonFriends both require !isUserGuest, and its
          only other button branch is the current-user label, so a guest gets no action box at all. */}
      {isUserGuest ? null : (
        <div className="player-search-actions padding-x-large padding-bottom-large">
          {user.isCurrentUser ? (
            <Button className="width-full" isDisabled size="Medium" variant="Standard">
              {selfLabel}
            </Button>
          ) : (
            <PlayerCardActions
              isChatEntrypointEnabled={isChatEntrypointEnabled}
              isLoading={isLoading}
              onAcceptFriend={onAcceptFriend}
              onAddFriend={onAddFriend}
              onJoinGame={onJoinGame}
              onStartChat={onStartChat}
              user={user}
            />
          )}
        </div>
      )}
    </article>
  );
};

export default PlayerCard;
