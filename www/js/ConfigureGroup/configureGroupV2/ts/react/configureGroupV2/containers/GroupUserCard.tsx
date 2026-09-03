import React, { useMemo, useState, useRef } from 'react';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { Link, useSystemFeedback } from 'react-style-guide';
import { Thumbnail2d, ThumbnailTypes } from 'roblox-thumbnails';
import { BadgeSizes, VerifiedBadgeIconContainer } from 'roblox-badges';
import { createPortal } from 'react-dom';
import { groupsConfig } from '../translation.config';
import { Group, GroupPermissions, User, Member } from '../../shared/types';
import getProfileUrl from '../utils';

import MenuActions from '../components/MenuActions';

export type GroupUserCardProps = {
  group: Group;
  user: User;
  actingUser?: Member;
  actingUserPermissions?: GroupPermissions;
  showGroupBanDetails?: boolean;
} & WithTranslationsProps;

const GroupUserCard = ({
  group,
  user,
  actingUser,
  actingUserPermissions,
  showGroupBanDetails,
  translate
}: GroupUserCardProps): JSX.Element | null => {
  const actingUserProfileUrl = useMemo(
    () => (actingUser ? getProfileUrl(actingUser?.user.userId) : null),
    [actingUser]
  );
  const userProfileUrl = useMemo(() => getProfileUrl(user.userId), [user.userId]);
  const userUsername = `@${user.username}`;
  const [showUserCard, setShowUserCard] = useState(true);
  const { SystemFeedbackComponent } = useSystemFeedback();

  return (
    <React.Fragment>
      {createPortal(
        // So we can unmount the component but still retain notifications
        <SystemFeedbackComponent />,
        document.body
      )}
      {showUserCard && (
        <li className='list-item avatar-card avatar-headshot' id={`group-user-card-${user.userId}`}>
          <div className='avatar-card-container'>
            <div className='avatar-card-content'>
              <div className='avatar avatar-card-fullbody'>
                <Link className='avatar-card-link' url={userProfileUrl}>
                  <Thumbnail2d
                    type={ThumbnailTypes.avatarHeadshot}
                    targetId={user.userId}
                    altName={user.username}
                  />
                </Link>
              </div>
              <div className='avatar-card-caption avatar-card-caption-with-menu'>
                <span>
                  <div className='group-member-name-container' id='user-card-display-name'>
                    <Link
                      className='avatar-name text-overflow'
                      title={user.displayName}
                      url={userProfileUrl}>
                      {user.displayName}
                    </Link>
                    {user.hasVerifiedBadge && (
                      <span className='user-card-body-name-container-badge'>
                        <VerifiedBadgeIconContainer size={BadgeSizes.SUBHEADER} />
                      </span>
                    )}
                  </div>
                  <div className='avatar-card-label text-overflow' id='user-card-username'>
                    {userUsername}
                  </div>
                  {showGroupBanDetails && (
                    <div className='avatar-card-label text-overflow' id='banned-by'>
                      {translate('Label.BannedBy')}{' '}
                      <span className='inline'>
                        <Link className='text-link' url={actingUserProfileUrl ?? ''}>
                          {actingUser?.user.username}
                        </Link>
                      </span>
                    </div>
                  )}
                </span>
              </div>
              <MenuActions
                useGroupBanMenuActions={showGroupBanDetails}
                groupId={group.id}
                userId={user.userId}
                actingUserPermissions={actingUserPermissions}
                setShowUserCard={setShowUserCard}
              />
            </div>
          </div>
        </li>
      )}
    </React.Fragment>
  );
};

export default withTranslations(GroupUserCard, groupsConfig);
