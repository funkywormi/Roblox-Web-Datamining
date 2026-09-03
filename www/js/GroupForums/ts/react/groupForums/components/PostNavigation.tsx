import classNames from 'classnames';
import React from 'react';
import { Link } from 'react-router-dom';

export type PostNavigationProps = {
  containerClassName?: string;
  categoryName: string;
  postTitle: string | undefined;
  backRoute: string;
};

const PostNavigation = ({
  categoryName,
  backRoute,
  postTitle,
  containerClassName
}: PostNavigationProps): JSX.Element => {
  const separator = ' > ';
  return (
    <div className={classNames('group-forums-post-navigation', containerClassName)}>
      <Link to={backRoute} className='group-forums-post-navigation-category text-link'>
        {categoryName}
      </Link>
      {postTitle && (
        <div className='group-forums-post-navigation-post-title text-default'>
          {separator}
          {postTitle}
        </div>
      )}
    </div>
  );
};

export default PostNavigation;
