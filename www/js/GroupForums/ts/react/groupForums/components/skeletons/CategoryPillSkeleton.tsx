import React from 'react';
import classNames from 'classnames';
import { StyleSize } from '../../../shared/constants/groupConstants';

export type CategoryPillSkeletonProps = {
  size: StyleSize;
};

const CategoryPillSkeleton = ({ size }: CategoryPillSkeletonProps): JSX.Element => {
  return (
    <div
      className={classNames(
        'group-forums-category-pill-skeleton',
        'group-forums-skeleton',
        size && `group-forums-category-pill-skeleton-length-${size}`
      )}
    />
  );
};

export default CategoryPillSkeleton;
