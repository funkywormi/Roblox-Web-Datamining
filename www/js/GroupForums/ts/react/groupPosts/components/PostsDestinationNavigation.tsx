import React from 'react';
import type { ReactNode } from 'react';
import classNames from 'classnames';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-utilities';
import announcementRoutes from '../../groupShouts/constants/announcementRoutes';

type PostsDestinationNavigationProps = {
  isAnnouncementsArchiveEnabled: boolean;
  children?: ReactNode;
};

const PostsDestinationNavigation = ({
  isAnnouncementsArchiveEnabled,
  children
}: PostsDestinationNavigationProps): JSX.Element => {
  const { translate } = useTranslation();

  return (
    <div className='group-posts-destinations'>
      <Link
        className={classNames(
          'content-action-forum-category group-posts-destination-pill group-posts-announcements-pill',
          isAnnouncementsArchiveEnabled && 'active',
          'clickable'
        )}
        aria-current={isAnnouncementsArchiveEnabled ? 'page' : undefined}
        to={announcementRoutes.announcementsRoute}>
        {translate('Heading.Announcements')}
      </Link>
      {children && <span className='group-posts-destinations-divider' aria-hidden='true' />}
      {children}
    </div>
  );
};

export default PostsDestinationNavigation;
