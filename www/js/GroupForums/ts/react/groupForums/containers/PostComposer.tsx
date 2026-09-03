import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useSystemFeedback } from 'react-style-guide';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { useQuery } from '@tanstack/react-query';
import { httpResponseCodes } from 'core-utilities';
import { groupsConfig } from '../translation.config';
import TextContentEditor from '../../shared/components/content/TextContentEditor';
import CategoriesList from './CategoriesList';
import groupForumsConstants from '../constants/groupForumsConstants';
import forumsService from '../services/forumsService';
import { useForumPermissions } from '../contexts/ForumPermissionsContext';
import useForumStore from '../hooks/useForumStore';
import { ForumsErrorResponse, ForumPost, ForumCategory } from '../types';
import { getPostKey } from '../services/queryKeys';
import CreatePostButton from '../components/CreatePostButton';
import ForumTierGateMessage from '../components/ForumTierGateMessage';
import useForumTierGate from '../hooks/useForumTierGate';
import {
  GetForumPostContentValidationErrorKey,
  GetForumPostTitleValidationErrorKey
} from '../utils/groupForumsValidation';
import useForumsRateLimitCountdown from '../hooks/useForumsRateLimitCountdown';
import { MessageContent } from '../../shared/types';
import { logGroupForumsClickEvent } from '../../shared/utils/logging';
import { getPlainText, hasRichTextContent } from '../../shared/utils/messageContentUtils';
import usePostComposerAttachments from '../hooks/usePostComposerAttachments';
import { CreateSupportTicketRequest, TicketCategory } from '../types/supportTicket';
import { getPostErrorKey, MODERATION_ERROR_KEY, NETWORK_ERROR_KEY } from '../utils/postErrorUtils';

export type PostComposerProps = {
  defaultCategoryId: string;
  editingPostId?: string;
} & WithTranslationsProps;

const PostComposer = ({
  defaultCategoryId,
  editingPostId,
  translate
}: PostComposerProps): JSX.Element => {
  const rateLimitCountdown = useForumsRateLimitCountdown('post');
  const history = useHistory();
  const groupId = useForumStore.use.groupId();
  const categoryId = useForumStore.use.categoryId()!;
  const categoryShortId = useForumStore.use.categoryShortId()!;
  const categoryName = useForumStore.use.categoryName()!;
  const categories = useForumStore.use.categories();

  const [activeCategoryId, setActiveCategoryId] = useState(defaultCategoryId);
  const [submitErrorKey, setSubmitErrorKey] = useState<string | null>(null);
  const { canCreatePost, canEditPost, canCreatePostInCategory } = useForumPermissions();

  const { systemFeedbackService } = useSystemFeedback();
  const setPostRateLimitExpiresAt = useForumStore.use.setPostRateLimitExpiresAt();
  const isEditing = !!editingPostId;

  // Latest in-progress title/content
  const postDraftRef = useRef<{ title: string; content: string }>({ title: '', content: '' });
  const getSupportTicketPrefillDetails = useCallback(() => {
    const { title, content } = postDraftRef.current;
    return [title, content]
      .map(part => part.trim())
      .filter(Boolean)
      .join('\n');
  }, []);
  const { isLoading, data: forumPost } = useQuery<ForumPost | undefined>({
    retry: 1,
    queryKey: getPostKey(groupId, categoryId, editingPostId ?? ''),
    queryFn: async () => {
      if (!editingPostId) {
        return undefined;
      }
      if (!groupId || groupId === 0) {
        return undefined;
      }
      const response = await forumsService.getGroupForumPostsByIds(groupId, categoryId, [
        editingPostId
      ]);

      return response.data[0];
    },
    onError: () => systemFeedbackService.warning(translate(NETWORK_ERROR_KEY)),
    enabled: isEditing
  });

  const {
    supportTicketAttachment,
    leadingControl: attachmentLeadingControl,
    footer: supportTicketFooter,
    modal: supportTicketModal
  } = usePostComposerAttachments({
    activeCategoryId,
    isEditing,
    getPrefillDetails: getSupportTicketPrefillDetails
  });

  const onSubmit = useCallback(
    async ({ title, content }: { title: string; content: MessageContent }) => {
      const category = categories.find(c => c.shortId === activeCategoryId);
      if (!category) {
        setSubmitErrorKey(NETWORK_ERROR_KEY);
        return false;
      }

      const postCategoryId = category.id;
      try {
        if (editingPostId) {
          if (!forumPost) {
            return false;
          }
          await forumsService.updateGroupForumComment(
            groupId,
            postCategoryId,
            editingPostId,
            forumPost.firstComment.id,
            content
          );
          history.push(
            groupForumsConstants.router.getPostRoute(
              activeCategoryId,
              categoryName,
              forumPost.shortId,
              forumPost.name
            )
          );
        } else {
          const supportTicket: CreateSupportTicketRequest | undefined = supportTicketAttachment
            ? {
                ticketCategory: TicketCategory.BugReport,
                universeId: supportTicketAttachment.universeId,
                details: supportTicketAttachment.details.trim() || null,
                device: supportTicketAttachment.device,
                shareUserInfo: supportTicketAttachment.shareUserInfo,
                assetIds: supportTicketAttachment.screenshotAssetIds ?? []
              }
            : undefined;

          const { shortId: postShortId } = await forumsService.createGroupForumPost(
            groupId,
            postCategoryId,
            title,
            content,
            supportTicket
          );
          history.push(
            groupForumsConstants.router.getPostRoute(
              activeCategoryId,
              categoryName,
              postShortId,
              title
            )
          );
        }

        const logEventData = editingPostId
          ? {
              clickTargetType: 'editPost',
              clickTargetId: editingPostId
            }
          : {
              clickTargetType: 'createPost',
              clickTargetId: activeCategoryId
            };

        logGroupForumsClickEvent({
          groupId,
          ...logEventData,
          hasRichText: hasRichTextContent(content)
        });
        return true;
      } catch (error) {
        const typedError = error as ForumsErrorResponse;
        if (
          typedError.status === httpResponseCodes.tooManyAttempts &&
          typedError.retryAfterSeconds
        ) {
          setPostRateLimitExpiresAt(Date.now() + typedError.retryAfterSeconds * 1000);
        } else {
          setSubmitErrorKey(getPostErrorKey(error));
        }
      }

      return false;
    },
    [
      editingPostId,
      activeCategoryId,
      groupId,
      forumPost,
      history,
      categories,
      categoryName,
      setPostRateLimitExpiresAt,
      supportTicketAttachment
    ]
  );

  const onBack = useCallback(() => {
    if (editingPostId) {
      history.push(
        groupForumsConstants.router.getPostRoute(
          categoryShortId,
          categoryName,
          forumPost?.shortId || editingPostId,
          forumPost?.name || 'post'
        )
      );
    } else {
      history.push(groupForumsConstants.router.getCategoryRoute(categoryShortId, categoryName));
    }
  }, [history, editingPostId, categoryShortId, categoryName, forumPost]);

  const onChange = useCallback(
    ({ title, content }: { title: string; content: MessageContent }) => {
      postDraftRef.current = { title, content: getPlainText(content) };
      if (submitErrorKey) {
        setSubmitErrorKey(null);
      }
    },
    [submitErrorKey]
  );

  useEffect(() => {
    // Redirect back if user cannot create or edit posts or if the post is locked
    if (
      !canCreatePost ||
      (editingPostId && forumPost && (!canEditPost(forumPost.createdBy) || forumPost.isLocked))
    ) {
      onBack();
    }
  }, [canCreatePost, canEditPost, editingPostId, forumPost, onBack]);

  const defaultTitle = forumPost?.name;
  const defaultContent = forumPost?.firstComment?.content;

  const { isTierGated, isResolving: isTierGateResolving } = useForumTierGate();

  // The create-post button is disabled for gated viewers, but the composer has
  // its own route they can still reach directly.
  if (isTierGated) {
    return (
      <div className='post-composer'>
        <ForumTierGateMessage testId='forum-post-tier-gate' />
      </div>
    );
  }

  return (
    <div className='post-composer'>
      <TextContentEditor
        hasTitle
        headerText={translate(editingPostId ? 'Action.EditPost' : 'Action.CreatePost')}
        contentPlaceholder={translate('Label.WriteSomething')}
        submitText={translate('Action.Post')}
        submitDisabled={submitErrorKey === MODERATION_ERROR_KEY}
        customControls={
          <div className='post-composer-categories-control'>
            <h5 className='post-composer-categories-label'>{translate('Heading.Categories')}</h5>
            <div className='post-composer-categories-list'>
              <CategoriesList
                activeCategoryId={activeCategoryId}
                onSetActiveCategory={setActiveCategoryId}
                locked={isEditing}
                // Only show categories the user has permission to create posts in
                categoryFilter={(category: ForumCategory) => canCreatePostInCategory(category.id)}
              />
            </div>
          </div>
        }
        titleMaxLength={groupForumsConstants.limits.postTitleMaxLength}
        contentMaxLength={groupForumsConstants.limits.postContentMaxLength}
        defaultTitle={defaultTitle}
        defaultContent={defaultContent}
        titleLocked={isEditing}
        errorKey={submitErrorKey}
        onSubmit={onSubmit}
        onBack={onBack}
        onChange={onChange}
        // Hold the editor in its loading state until the tier gate resolves, so a
        // gated viewer never gets a composer that disappears once it does.
        isLoading={isTierGateResolving || (isEditing && (isLoading || !forumPost))}
        SubmitButton={CreatePostButton}
        titleLabel={translate('Label.PostTitle')}
        contentLabel={translate('Label.PostContent')}
        getTitleValidationErrorKey={GetForumPostTitleValidationErrorKey}
        getContentValidationErrorKey={GetForumPostContentValidationErrorKey}
        countdown={rateLimitCountdown}
        isRichTextEnabled
        contentLeadingControl={attachmentLeadingControl}
        contentFooter={supportTicketFooter}
      />
      {supportTicketModal}
    </div>
  );
};

PostComposer.displayName = 'PostComposer';

export default withTranslations(PostComposer, groupsConfig);
