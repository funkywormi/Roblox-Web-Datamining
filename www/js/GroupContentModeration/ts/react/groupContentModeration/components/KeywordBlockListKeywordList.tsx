import React from 'react';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { groupsConfig } from '../translation.config';
import KeywordBlockListKeywordItem from './KeywordBlockListKeywordItem';
import { BlockedKeyword } from '../types';
import SectionDisclaimer from '../../shared/components/SectionDisclaimer';
import KeywordBlockListKeywordItemSkeleton from './KeywordBlockListKeywordItemSkeleton';

export type KeywordBlockListKeywordListProps = {
  keywords: BlockedKeyword[];
  isFetching: boolean;
  loadingError: boolean;
  canEdit: boolean;
  isItemSubmitting: (keywordId: string) => boolean;
  getItemEditError: (keywordId: string) => string | null;
  resetItemEditError: (keywordId: string) => void;
  onDeleteItem: (keywordId: string) => Promise<void>;
  onSaveEditItem: (keywordId: string, updatedKeyword: string) => Promise<void>;
  onRefetchKeywords: () => void;
} & WithTranslationsProps;

const KeywordBlockListKeywordList = ({
  keywords,
  isFetching,
  loadingError,
  canEdit,
  isItemSubmitting,
  getItemEditError,
  resetItemEditError,
  onDeleteItem,
  onSaveEditItem,
  onRefetchKeywords,
  translate
}: KeywordBlockListKeywordListProps): JSX.Element | null => {
  if (isFetching) {
    return (
      <div className='keyword-block-list-keyword-list-container section-content'>
        {Array.from({ length: 10 }).map((_, idx) => (
          <KeywordBlockListKeywordItemSkeleton
            // eslint-disable-next-line react/no-array-index-key
            key={idx}
            canEdit={canEdit}
            showDivider={idx !== 10}
          />
        ))}
      </div>
    );
  }

  let disclaimerProps = null;

  if (loadingError) {
    disclaimerProps = {
      iconClassName: 'icon-status-alert',
      heading: translate('Error.LoadBlockedKeywordsTitle'),
      message: translate('Error.ReloadingSubtitle'),
      buttonText: translate('Action.RetryLoadingKeywords'),
      onClick: onRefetchKeywords
    };
  } else if (keywords.length === 0) {
    disclaimerProps = {
      iconClassName: 'chat-side-icon',
      heading: translate('Message.NoBlockedKeywordsTitle'),
      message: translate('Message.NoBlockedKeywordsSubtitle')
    };
  }

  if (disclaimerProps) {
    return (
      <div className='keyword-block-list-keyword-list-container'>
        <SectionDisclaimer {...disclaimerProps} />
      </div>
    );
  }

  return (
    <div className='keyword-block-list-keyword-list-container section-content'>
      {keywords.map((keyword, index) => (
        <KeywordBlockListKeywordItem
          key={keyword.id}
          keyword={keyword}
          canEdit={canEdit}
          disableSubmit={isItemSubmitting(keyword.id)}
          onDelete={onDeleteItem}
          onSaveEdit={onSaveEditItem}
          showDivider={index < keywords.length - 1}
          errorMessage={getItemEditError(keyword.id)}
          resetError={resetItemEditError}
        />
      ))}
    </div>
  );
};

export default withTranslations(KeywordBlockListKeywordList, groupsConfig);
