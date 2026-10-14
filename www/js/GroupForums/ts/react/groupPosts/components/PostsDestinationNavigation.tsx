import React from 'react';
import classNames from 'classnames';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-utilities';
import { Chip } from '@rbx/foundation-ui';
import announcementRoutes from '../../groupShouts/constants/announcementRoutes';

type PostsDestinationNavigationProps = {
  isAnnouncementsArchiveEnabled: boolean;
  showDivider: boolean;
};

const PostsDestinationNavigation = ({
  isAnnouncementsArchiveEnabled,
  showDivider
}: PostsDestinationNavigationProps): JSX.Element => {
  const history = useHistory();
  const { translate } = useTranslation();

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }

    event.preventDefault();
    history.push(announcementRoutes.announcementsRoute);
  };

  return (
    <React.Fragment>
      <Chip
        as='a'
        aria-current={isAnnouncementsArchiveEnabled ? 'page' : undefined}
        className={classNames(
          'group-posts-destination-chip',
          isAnnouncementsArchiveEnabled && 'active'
        )}
        href={`#!${announcementRoutes.announcementsRoute}`}
        onClick={handleClick}
        size='Medium'
        text={translate('Heading.Announcements')}
      />
      {showDivider && <span className='group-posts-destinations-divider' aria-hidden='true' />}
    </React.Fragment>
  );
};

export default PostsDestinationNavigation;
