import React, { useMemo } from 'react';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import PaginationBase from '../../../../../../Roblox.CoreUI.WebApp/Roblox.CoreUI.WebApp/js/react/pagination/components/Pagination';
import { groupsConfig } from '../translation.config';
import groupContentModerationConstants from '../constants/groupContentModerationConstants';

export type KeywordBlockListKeywordListHeaderProps = {
  totalKeywordsCount: number;
  currentPage: number;
  onPageChange: (page: number) => void;
} & WithTranslationsProps;

const KeywordBlockListKeywordListHeader = ({
  totalKeywordsCount,
  currentPage,
  onPageChange,
  translate
}: KeywordBlockListKeywordListHeaderProps): JSX.Element | null => {
  const totalPages = useMemo(() => {
    if (totalKeywordsCount <= 0) return 1;
    return Math.ceil(
      totalKeywordsCount / groupContentModerationConstants.pageCounts.blockedKeywordsPerPage
    );
  }, [totalKeywordsCount]);

  return (
    <div className='keyword-block-list-keyword-list-header keyword-block-list-sub-header flex items-center justify-between'>
      <div className='keyword-block-list-keyword-list-header-title'>
        {translate('Heading.ActiveList', { count: totalKeywordsCount })}
      </div>
      <PaginationBase
        onChange={onPageChange}
        current={currentPage}
        total={totalPages}
        hasNext={currentPage < totalPages}
      />
    </div>
  );
};

export default withTranslations(KeywordBlockListKeywordListHeader, groupsConfig);
