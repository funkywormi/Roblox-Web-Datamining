import React, { useCallback } from 'react';
import classNames from 'classnames';
import { Icon } from '@rbx/foundation-ui';
import { ForumCategory } from '../types';
import groupForumsConstants from '../constants/groupForumsConstants';
import { useCommunityProductFeatures } from '../../shared/contexts/CommunityProductFeaturesContext';

// TODO: replace custom-styled anchor element with foundation-web Chip component once it has href support

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

  // Handle keyboard interactions
  const handleKeyDown = (event: React.KeyboardEvent<HTMLAnchorElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  };

  return (
    <a
      role='button'
      tabIndex={0}
      className={classNames(
        'content-action-forum-category group-forums-category-pill',
        isActive && 'active',
        !!onClick && 'clickable'
      )}
      href={groupForumsConstants.deepLinks.groupForumCategoryUrl(
        category.groupId,
        category.shortId,
        category.name
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}>
      {showRestrictedIndicator && (
        <Icon
          name='icon-filled-lock-closed'
          size='Small'
          className='group-forums-category-pill-lock-icon'
        />
      )}
      {category.name}
    </a>
  );
};

export default CategoryPill;
