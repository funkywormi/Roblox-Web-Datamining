import React, { useCallback, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { useSystemFeedback } from 'react-style-guide';
import { groupsConfig } from '../translation.config';
import { GroupPermissions } from '../../shared/types';
import contentModerationService from '../services/contentModerationService';
import groupContentModerationConstants from '../constants/groupContentModerationConstants';
import KeywordBlockListKeywordComposer from './KeywordBlockListKeywordComposer';
import KeywordBlockListKeywordList from './KeywordBlockListKeywordList';
import KeywordBlockListKeywordListHeader from './KeywordBlockListKeywordListHeader';
import { CreateBlockedKeywordsResponse, QueryError } from '../types';
import keywordValidationHelper from '../utils/keywordValidationHelper';
import {
  hasConflictError,
  hasInvalidRequestError,
  hasKeywordModeratedError,
  isNonValidationError
} from '../utils/queryErrorHelper';

const ITEMS_PER_PAGE = groupContentModerationConstants.pageCounts.blockedKeywordsPerPage;

export type KeywordBlockListSectionProps = {
  groupId: number;
  permissions: GroupPermissions;
} & WithTranslationsProps;

const KeywordBlockListSection = ({
  groupId,
  permissions,
  translate
}: KeywordBlockListSectionProps): JSX.Element | null => {
  const { SystemFeedbackComponent, systemFeedbackService } = useSystemFeedback();
  const queryClient = useQueryClient();

  const canEdit = permissions?.groupContentModerationPermissions?.manageKeywordBlockList || false;
  const [totalActiveKeywordsCount, setTotalActiveKeywordsCount] = useState<number>(0);
  const [overrideCreateErrorMessage, setOverrideCreateErrorMessage] = useState<string | null>(null);
  const [currentPageCursor, setCurrentPageCursor] = useState<string | null>(null);
  const [pagingDirection, setPagingDirection] = useState<number>(
    groupContentModerationConstants.paging.next
  );
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [newKeywords, setNewKeywords] = useState<string>('');

  const {
    data: blockedKeywordsData,
    isError: loadingKeywordsError,
    isLoading: isFetchingKeywords,
    refetch: refetchBlockedKeywords
  } = useQuery(
    [
      groupContentModerationConstants.queryKeys.blockedKeywordsList,
      groupId,
      currentPageCursor,
      pagingDirection
    ],
    async () => {
      const response = await contentModerationService.getGroupBlockedKeywords(
        groupId,
        ITEMS_PER_PAGE,
        pagingDirection,
        currentPageCursor ?? undefined
      );
      return {
        keywords: response.data || [],
        totalActiveKeywordsCount: response.totalActiveKeywordsCount || 0,
        nextPageCursor: response.nextPageCursor || null,
        previousPageCursor: response.previousPageCursor || null
      };
    },
    {
      enabled: !!groupId,
      keepPreviousData: true,
      refetchOnWindowFocus: true,
      onSuccess: data => {
        // We don't want to have the total count reset to 0 while we are fetching the list
        // so we only reset it when we successfully fetch the data
        setTotalActiveKeywordsCount(data.totalActiveKeywordsCount);
      }
    }
  );

  const { keywords: blockedKeywords = [], nextPageCursor = null, previousPageCursor = null } =
    blockedKeywordsData || {};

  const resetKeywordList = useCallback(() => {
    setCurrentPage(1);
    setCurrentPageCursor(null);
    setPagingDirection(groupContentModerationConstants.paging.next);
    // eslint-disable-next-line no-void
    void queryClient.invalidateQueries([
      groupContentModerationConstants.queryKeys.blockedKeywordsList,
      groupId
    ]);
  }, [groupId, queryClient]);

  const createKeywords = useMutation({
    mutationFn: async (keywords: string) => {
      return contentModerationService.createGroupBlockedKeywords(groupId, keywords);
    },
    onSuccess: (data: CreateBlockedKeywordsResponse) => {
      setNewKeywords('');
      const newKeywordsCreated = !!data?.createdKeywords?.length;
      if (newKeywordsCreated) {
        resetKeywordList();
        if (data.createdKeywords.length > 1) {
          systemFeedbackService.success(
            translate('Message.KeywordsAdded', { count: data.createdKeywords.length })
          );
        } else {
          systemFeedbackService.success(translate('Message.KeywordAdded'));
        }
      }
      if (!newKeywordsCreated && data.hadDuplicateKeywords) {
        systemFeedbackService.warning(translate('Message.KeywordsAddedNoKeywords'));
      }

      // If there were moderated keywords, we show a validation message
      if (data.hadModeratedKeywords) {
        setOverrideCreateErrorMessage(translate('Error.CreateKeywordModerated'));
      }
    },
    onError: error => {
      try {
        const queryError = error as QueryError;
        if (isNonValidationError(queryError)) {
          systemFeedbackService.warning(translate('NetworkError'));
        }
        // Reset the new keywords input if there was a keyword moderated error
        // We message the users that these keywords are already blocked and won't show up in the list
        if (hasKeywordModeratedError(queryError)) {
          setNewKeywords('');
        }
      } catch {
        systemFeedbackService.warning(translate('NetworkError'));
      }
    }
  });

  const createBlockedKeywords = useCallback(async () => {
    if (newKeywords.trim()) {
      await createKeywords.mutateAsync(newKeywords.trim());
    }
  }, [createKeywords, newKeywords]);

  const editKeyword = useMutation({
    mutationFn: async ({
      keywordId,
      updatedKeyword
    }: {
      keywordId: string;
      updatedKeyword: string;
    }) => {
      await contentModerationService.updateGroupBlockedKeyword(groupId, keywordId, updatedKeyword);
    },
    onSuccess: () => {
      resetKeywordList();
      systemFeedbackService.success(translate('Message.KeywordEdited'));
    },
    onError: error => {
      try {
        const queryError = error as QueryError;
        if (isNonValidationError(queryError)) {
          systemFeedbackService.warning(translate('NetworkError'));
        }
      } catch {
        systemFeedbackService.warning(translate('NetworkError'));
      }
    }
  });

  const editBlockedKeyword = useCallback(
    async (keywordId: string, updatedKeyword: string) => {
      return editKeyword.mutateAsync({
        keywordId,
        updatedKeyword
      });
    },
    [editKeyword]
  );

  const deleteKeyword = useMutation({
    mutationFn: async (keywordId: string) => {
      await contentModerationService.deleteGroupBlockedKeyword(groupId, keywordId);
    },
    onSuccess: () => {
      // eslint-disable-next-line no-void
      void queryClient.invalidateQueries([
        groupContentModerationConstants.queryKeys.blockedKeywordsList,
        groupId,
        currentPageCursor,
        pagingDirection
      ]);
      systemFeedbackService.success(translate('Message.KeywordDeleted'));
    },
    onError: () => {
      systemFeedbackService.warning(translate('NetworkError'));
    }
  });

  const deleteBlockedKeyword = useCallback(
    async (keywordId: string) => {
      return deleteKeyword.mutateAsync(keywordId);
    },
    [deleteKeyword]
  );

  const isSubmitting = useMemo(() => {
    return createKeywords.isLoading || editKeyword.isLoading || deleteKeyword.isLoading;
  }, [createKeywords.isLoading, editKeyword.isLoading, deleteKeyword.isLoading]);

  const changePage = useCallback(
    (newPageNumber: number) => {
      if (isFetchingKeywords || isSubmitting) {
        return;
      }
      if (newPageNumber === currentPage) {
        return;
      }
      let needToFetch = false;
      if (currentPage > newPageNumber && previousPageCursor) {
        setPagingDirection(groupContentModerationConstants.paging.previous);
        setCurrentPageCursor(previousPageCursor);
        needToFetch = true;
      } else if (currentPage < newPageNumber && nextPageCursor) {
        setPagingDirection(groupContentModerationConstants.paging.next);
        setCurrentPageCursor(nextPageCursor);
        needToFetch = true;
      }
      if (needToFetch) {
        setCurrentPage(newPageNumber);
      }
    },
    [currentPage, isFetchingKeywords, isSubmitting, nextPageCursor, previousPageCursor]
  );

  const isItemSubmitting = useCallback(
    (keywordId: string) => {
      return (
        (editKeyword.isLoading && editKeyword.variables?.keywordId === keywordId) ||
        (deleteKeyword.isLoading && deleteKeyword.variables === keywordId)
      );
    },
    [
      deleteKeyword.isLoading,
      deleteKeyword.variables,
      editKeyword.isLoading,
      editKeyword.variables?.keywordId
    ]
  );

  const getItemEditError = useCallback(
    (keywordId: string): string | null => {
      if (editKeyword.isError && editKeyword.variables?.keywordId === keywordId) {
        const error = editKeyword.error as QueryError;
        if (hasKeywordModeratedError(error)) {
          return translate('Error.EditKeywordModerated');
        }
        if (hasInvalidRequestError(error)) {
          return translate('Error.EditKeywordInvalidRequest');
        }
        if (hasConflictError(error)) {
          return translate('Error.EditKeywordConflict');
        }
      }
      return null;
    },
    [editKeyword.error, editKeyword.isError, editKeyword.variables?.keywordId, translate]
  );

  const resetItemEditError = useCallback(
    (keywordId: string) => {
      if (editKeyword.isError && editKeyword.variables?.keywordId === keywordId) {
        editKeyword.reset();
      }
    },
    [editKeyword]
  );

  const createErrorMessage = useMemo(() => {
    if (!createKeywords.isError) return null;

    if (createKeywords.error) {
      const error = createKeywords.error as QueryError;
      if (hasKeywordModeratedError(error)) {
        return translate('Error.CreateKeywordModerated');
      }
      if (hasInvalidRequestError(error)) {
        return translate('Error.CreateKeywordInvalidRequest');
      }
    }

    return null;
  }, [createKeywords.error, createKeywords.isError, translate]);

  const resetCreateErrorMessage = useCallback(() => {
    if (overrideCreateErrorMessage) {
      setOverrideCreateErrorMessage(null);
    }
    if (createKeywords.isError) {
      createKeywords.reset();
    }
  }, [createKeywords, overrideCreateErrorMessage]);

  const onChangeKeywords = useCallback(
    (keywords: string) => {
      setNewKeywords(keywords);
      resetCreateErrorMessage();
    },
    [resetCreateErrorMessage]
  );

  const createKeywordValidationError = useMemo(() => {
    if (overrideCreateErrorMessage || createErrorMessage)
      return overrideCreateErrorMessage || createErrorMessage;
    if (!newKeywords.trim()) return null;
    const keywords = newKeywords.split(',');

    for (let i = 0; i < keywords.length; i++) {
      const currentKeyword = keywords[i];
      const validationKey = keywordValidationHelper(currentKeyword, false);
      if (validationKey) {
        return translate(validationKey, {
          keyword: currentKeyword?.trim(),
          maxLength: groupContentModerationConstants.limits.maxBlockedKeywordLength,
          minLength: groupContentModerationConstants.limits.minBlockedKeywordLength
        });
      }
    }

    return null;
  }, [createErrorMessage, newKeywords, overrideCreateErrorMessage, translate]);

  return (
    <div className='keyword-block-list-section section-content remove-panel'>
      <div className='keyword-block-list-section-header section-content remove-panel'>
        <h2>{translate('Heading.KeywordBlocklist')}</h2>
        <div>{translate('Description.KeywordBlockList')}</div>
        <div className='padding-top-medium'>
          {translate('Description.KeywordBlocklistMatching', {
            wildcard: groupContentModerationConstants.blockedKeywords.wildcard
          })}
          &nbsp;
          <a
            className='text-link'
            href={groupContentModerationConstants.articles.learnMoreUrl}
            target='_blank'
            rel='noreferrer'>
            {translate('Action.LearnMoreLink')}
          </a>
        </div>
        <div>
          {translate('Description.KeywordBlocklistMatching2', {
            limit: groupContentModerationConstants.limits.maxBlockedKeywordCountPerRequest
          })}
        </div>
      </div>
      {canEdit && (
        <KeywordBlockListKeywordComposer
          keywords={newKeywords}
          onChangeKeywords={onChangeKeywords}
          onAddKeyword={createBlockedKeywords}
          errorMessage={createKeywordValidationError}
          disableSubmit={
            !newKeywords.trim() ||
            isFetchingKeywords ||
            createKeywords.isLoading ||
            !!createKeywordValidationError
          }
        />
      )}
      <div className='keyword-block-list-active-list-container section-content remove-panel'>
        <KeywordBlockListKeywordListHeader
          totalKeywordsCount={totalActiveKeywordsCount}
          currentPage={currentPage}
          onPageChange={changePage}
        />
        <KeywordBlockListKeywordList
          keywords={blockedKeywords}
          isFetching={isFetchingKeywords}
          loadingError={loadingKeywordsError}
          canEdit={canEdit}
          isItemSubmitting={isItemSubmitting}
          getItemEditError={getItemEditError}
          resetItemEditError={resetItemEditError}
          onDeleteItem={deleteBlockedKeyword}
          onSaveEditItem={editBlockedKeyword}
          onRefetchKeywords={refetchBlockedKeywords}
        />
      </div>
      <SystemFeedbackComponent />
    </div>
  );
};

export default withTranslations(KeywordBlockListSection, groupsConfig);
