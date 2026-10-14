import React from 'react';
import { useHistory } from 'react-router-dom';
import CategoriesList from '../../groupForums/containers/CategoriesList';
import groupForumsConstants from '../../groupForums/constants/groupForumsConstants';
import PostsDestinationNavigation from './PostsDestinationNavigation';

type AnnouncementNavigationProps = {
  showForumCategories: boolean;
};

const AnnouncementNavigation = ({
  showForumCategories
}: AnnouncementNavigationProps): JSX.Element => {
  const history = useHistory();
  const leadingContent = (
    <PostsDestinationNavigation isAnnouncementsArchiveEnabled showDivider={showForumCategories} />
  );

  if (!showForumCategories) {
    return <div className='group-forums-categories-list'>{leadingContent}</div>;
  }

  return (
    <CategoriesList
      activeCategoryId={null}
      leadingContent={leadingContent}
      onSetActiveCategory={(categoryShortId, categoryName) =>
        history.push(groupForumsConstants.router.getCategoryRoute(categoryShortId, categoryName))
      }
    />
  );
};

export default AnnouncementNavigation;
