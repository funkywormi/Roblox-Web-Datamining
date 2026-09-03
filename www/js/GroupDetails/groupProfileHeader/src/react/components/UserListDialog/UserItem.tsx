import React from 'react';
import './css/_userItem.scss';
import { User } from './types';
import constants from './constants';
import ActionButton from './ActionButton';
import { Action } from '../../../types';

const { Thumbnail2d, ThumbnailAvatarHeadshotSize, ThumbnailTypes } = (window as any).RobloxThumbnails;
const { VerifiedBadgeIconContainer, BadgeSizes } = (window as any).RobloxBadges;
const Presence = (window as any).RobloxPresence;

interface UserItemProps<TUser extends User> {
  user: TUser;
  onCloseModal?: () => void;
  onCtaAction?: (action: Action, userId: number) => void;
  // Optional per-user label rendered as a non-interactive pill immediately after
  // the displayName + verified badge, on the same line. Use this for callers that
  // want to mark a user in the list with a short status string -- e.g. an "Owner"
  // badge in groups. The string is rendered verbatim, so callers are responsible
  // for passing an already-translated value (`UserListDialog` does not own a
  // translation provider). Returning an empty string / null / undefined renders
  // nothing for that user. The visual style (background, text color, radius) is
  // owned by `_userItem.scss` so every consumer gets a consistent neutral pill;
  // see `.user-item-display-name-trailing` there.
  userDisplayNameTrailingLabel?: (user: TUser) => string | null | undefined;
}

const UserItem = <TUser extends User>({
  user,
  onCloseModal,
  onCtaAction,
  userDisplayNameTrailingLabel
}: UserItemProps<TUser>): React.ReactElement => {
  const formattedUsername = `@${user.username}`;
  const trailingLabel = userDisplayNameTrailingLabel?.(user);
  const hasTrailingLabel = typeof trailingLabel === 'string' && trailingLabel.length > 0;

  return (
    <li className="w-auto">
      <a className="user-item-clickable" href={constants.urls.profilePageUrl(user.userId)}>
        <div className="flex items-center grow-1 self-stretch clip">
          <div className="avatar-card-fullbody">
            {Thumbnail2d && (
              <Thumbnail2d
                type={ThumbnailTypes?.avatarHeadshot}
                size={ThumbnailAvatarHeadshotSize?.size48}
                targetId={user.userId}
                containerClass="avatar-card-image"
              />
            )}
            {Presence?.PresenceStatusIcon && (
              <Presence.PresenceStatusIcon className="icon-presence" userId={user.userId} />
            )}
          </div>
          <div className="grow-1 clip text-truncate-split text-no-wrap">
            <div className="text-title-medium text-truncate-split text-no-wrap user-item-display-name-row">
              {user.displayName}
              {user.hasVerifiedBadge && VerifiedBadgeIconContainer && (
                <>
                  {' '}
                  <VerifiedBadgeIconContainer overrideContainerClass="inline" size={BadgeSizes?.SUBHEADER} />
                </>
              )}
              {hasTrailingLabel && <span className="user-item-display-name-trailing">{trailingLabel}</span>}
            </div>
            <span className="text-body-medium">{formattedUsername}</span>
          </div>
          <ActionButton
            userId={user.userId}
            primaryAction={user.actions?.[0]}
            onCloseModal={onCloseModal}
            onCtaAction={onCtaAction}
          />
        </div>
      </a>
    </li>
  );
};

export default UserItem;
