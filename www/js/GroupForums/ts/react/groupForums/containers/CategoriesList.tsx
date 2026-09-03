import React, { FC, useEffect, useRef } from 'react';
import classNames from 'classnames';
import CategoryPill from '../components/CategoryPill';
import CategoryPillSkeleton from '../components/skeletons/CategoryPillSkeleton';
import { StyleSize } from '../../shared/constants/groupConstants';
import useForumStore from '../hooks/useForumStore';
import { ForumCategory } from '../types';

export type CategoriesContainerProps = {
  // undefined falls back to the active category in the store; null forces no pill to appear active.
  activeCategoryId?: string | null;
  onSetActiveCategory: (newCategoryId: string, newCategoryName: string) => void;
  locked?: boolean;
  categoryFilter?: (category: ForumCategory) => boolean;
};

const CategoriesList: FC<CategoriesContainerProps> = ({
  onSetActiveCategory,
  locked,
  activeCategoryId,
  categoryFilter
}) => {
  const stateCategoryId = useForumStore.use.categoryShortId();
  const categories = useForumStore.use.categories();
  const categoriesLoaded = useForumStore.use.categoriesLoaded();
  const listRef = useRef<HTMLDivElement>(null);

  const categoryId = activeCategoryId === undefined ? stateCategoryId : activeCategoryId;

  useEffect(() => {
    if (!categoriesLoaded) return;

    const handleScroll = () => {
      if (listRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = listRef.current;
        if (scrollLeft + clientWidth >= scrollWidth) {
          listRef.current.classList.remove('list-vignette');
        } else {
          listRef.current.classList.add('list-vignette');
        }
      }
    };

    const listElement = listRef.current;
    if (listElement) {
      listElement.addEventListener('scroll', handleScroll);
      handleScroll();
    }

    // eslint-disable-next-line consistent-return
    return () => {
      if (listElement) {
        listElement.removeEventListener('scroll', handleScroll);
      }
    };
  }, [categoriesLoaded]);

  if (!categoriesLoaded) {
    return (
      <div className='group-forums-categories-list list-vignette'>
        <CategoryPillSkeleton size={StyleSize.Small} />
        <CategoryPillSkeleton size={StyleSize.Large} />
        <CategoryPillSkeleton size={StyleSize.Medium} />
        <CategoryPillSkeleton size={StyleSize.Small} />
        <CategoryPillSkeleton size={StyleSize.Large} />
      </div>
    );
  }

  return (
    <div
      className={classNames('group-forums-categories-list', {
        'group-forums-categories-list-locked': locked
      })}
      ref={listRef}>
      {categories.map(category => {
        return (
          (!categoryFilter || categoryFilter(category)) && (
            <CategoryPill
              key={category.shortId}
              category={category}
              isActive={categoryId === category.shortId}
              onClick={locked ? undefined : onSetActiveCategory}
            />
          )
        );
      })}
    </div>
  );
};

export default CategoriesList;
