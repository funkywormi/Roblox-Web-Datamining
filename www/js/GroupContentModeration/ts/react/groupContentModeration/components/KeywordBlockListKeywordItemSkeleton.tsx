import React from 'react';

export type KeywordBlockListKeywordItemSkeletonProps = {
  canEdit: boolean;
  showDivider: boolean;
};

const KeywordBlockListKeywordItemSkeleton = ({
  canEdit,
  showDivider
}: KeywordBlockListKeywordItemSkeletonProps): JSX.Element | null => {
  return (
    <div className='keyword-block-list-keyword-item-container flex flex-col'>
      <div className='keyword-block-list-keyword-item-display flex justify-between items-start'>
        <div className='keyword-block-list-keyword-item-text-skeleton keyword-block-list-skeleton' />
        {canEdit && (
          <div className='keyword-block-list-keyword-item-actions flex items-center'>
            <div className='keyword-block-list-keyword-item-edit-skeleton keyword-block-list-skeleton' />
            <div className='keyword-block-list-keyword-item-delete-skeleton keyword-block-list-skeleton' />
          </div>
        )}
      </div>
      {showDivider && <div className='rbx-divider' />}
    </div>
  );
};

export default KeywordBlockListKeywordItemSkeleton;
