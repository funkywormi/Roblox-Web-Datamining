import React from 'react';
import CategoriesList from '../../groupForums/containers/CategoriesList';
import type { CategoriesNavigationProps } from '../../groupForums/containers/Categories';
import PostsDestinationNavigation from './PostsDestinationNavigation';

const ForumNavigation = ({ onSetActiveCategory }: CategoriesNavigationProps): JSX.Element => (
  <CategoriesList
    leadingContent={
      <PostsDestinationNavigation isAnnouncementsArchiveEnabled={false} showDivider />
    }
    onSetActiveCategory={onSetActiveCategory}
  />
);

export default ForumNavigation;
