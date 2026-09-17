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

  return (
    <PostsDestinationNavigation isAnnouncementsArchiveEnabled>
      {showForumCategories && (
        <CategoriesList
          activeCategoryId={null}
          onSetActiveCategory={(categoryShortId, categoryName) =>
            history.push(
              groupForumsConstants.router.getCategoryRoute(categoryShortId, categoryName)
            )
          }
        />
      )}
    </PostsDestinationNavigation>
  );
};

export default AnnouncementNavigation;
