import React, { useCallback } from 'react';
import classNames from 'classnames';
import { Chip } from '@rbx/foundation-ui';
import { ForumCategory } from '../types';
import groupForumsConstants from '../constants/groupForumsConstants';
import { useCommunityProductFeatures } from '../../shared/contexts/CommunityProductFeaturesContext';

export type CategoryPillProps = {
  category: ForumCategory;
  isActive: boolean;
  onClick?: (newCategoryId: string, newCategoryName: string) => void;
};

const CategoryPill = ({ category, isActive, onClick }: CategoryPillProps): JSX.Element => {
  const { features } = useCommunityProductFeatures();
  const showRestrictedIndicator = features.ForumsRestrictedCategories && !!category.isRestricted;

  const handleClick = useCallback(
    (event?: React.MouseEvent) => {
      if (event) {
        // suppress href native click
        event.preventDefault();
      }
      if (isActive) return;
      onClick?.(category.shortId, category.name);
    },
    [isActive, category.shortId, category.name, onClick]
  );

  return (
    <Chip
      as='a'
      aria-current={isActive ? 'page' : undefined}
      className={classNames('group-posts-destination-chip', isActive && 'active')}
      data-testid='forum-category-pill'
      href={groupForumsConstants.deepLinks.groupForumCategoryUrl(
        category.groupId,
        category.shortId,
        category.name
      )}
      leadingIconName={showRestrictedIndicator ? 'icon-filled-lock-closed' : undefined}
      onClick={handleClick}
      size='Medium'
      text={category.name}
    />
  );
};

export default CategoryPill;
