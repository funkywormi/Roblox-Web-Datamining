import React, { FC } from 'react';
import { useSystemFeedback } from 'react-style-guide';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { useQuery } from '@tanstack/react-query';
import { groupsConfig } from '../translation.config';
import groupForumsConstants from '../constants/groupForumsConstants';
import PostPreview from '../components/PostPreview';
import forumsService from '../services/forumsService';
import { getCategoriesKey } from '../services/queryKeys';
import { ForumCategory } from '../types';

type Props = { groupId: number } & WithTranslationsProps;

const LIMIT = 5;
const noop = (): null => null;

const GroupForumUpdates: FC<Props> = ({ translate, groupId }: Props) => {
  const { systemFeedbackService } = useSystemFeedback();
  const { isLoading, data: posts } = useQuery({
    queryFn: async () => {
      const response = await forumsService.getGroupForumUpdates(groupId, LIMIT);
      return response.data;
    },
    onError: () => systemFeedbackService.warning(translate('NetworkError')),
    retry: false,
    refetchOnWindowFocus: false
  });
  const { isLoading: isLoadingCats, data: categories } = useQuery({
    queryKey: getCategoriesKey(groupId),
    queryFn: async () => {
      const response = await forumsService.getGroupForumCategories(groupId, false);
      return response.data;
    },
    onError: () => systemFeedbackService.warning(translate('NetworkError')),
    retry: false,
    refetchOnWindowFocus: false
  });

  if (isLoading || !posts || !posts.length || isLoadingCats || !categories || !categories.length) {
    return null;
  }

  // map category ids to names for easy lookup
  const categoryInfo = new Map<string, ForumCategory>(
    categories.map(cat => [cat.id, cat] as [string, ForumCategory])
  );

  return (
    <div className='group-forums-updates'>
      <div className='container-header group-forums-updates-header'>
        <h2 className='group-forums-updates-header-title'>
          {translate('Heading.GroupForumsTopPosts')}
        </h2>
        <a
          className='see-all-link-icon'
          href={groupForumsConstants.deepLinks.groupForumUrl(groupId)}>
          {translate('Action.SeeAll')}
        </a>
      </div>
      <div className='group-forums-posts-list'>
        <div className='group-forums-post-list-content'>
          {posts.map(post => {
            return (
              <PostPreview
                hasMenu={false}
                hasRouter={false}
                showPinned={false}
                key={post.id}
                post={post}
                categoryName={categoryInfo.get(post.categoryId)?.name || ''}
                categoryShortId={categoryInfo.get(post.categoryId)?.shortId || ''}
                refetchPosts={noop}
                togglePostNotifications={noop}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

GroupForumUpdates.displayName = 'GroupForumUpdates';

export default withTranslations(GroupForumUpdates, groupsConfig);
