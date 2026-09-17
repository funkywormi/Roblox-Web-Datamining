import React from 'react';
import CategoriesList from '../../groupForums/containers/CategoriesList';
import type { CategoriesNavigationProps } from '../../groupForums/containers/Categories';
import PostsDestinationNavigation from './PostsDestinationNavigation';

const ForumNavigation = ({ onSetActiveCategory }: CategoriesNavigationProps): JSX.Element => (
  <PostsDestinationNavigation isAnnouncementsArchiveEnabled={false}>
    <CategoriesList onSetActiveCategory={onSetActiveCategory} />
  </PostsDestinationNavigation>
);

export default ForumNavigation;
