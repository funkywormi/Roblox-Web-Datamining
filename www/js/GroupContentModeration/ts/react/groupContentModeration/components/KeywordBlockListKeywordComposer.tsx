import React from 'react';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { groupsConfig } from '../translation.config';
import groupContentModerationConstants from '../constants/groupContentModerationConstants';
import SingleLineInputField from '../../shared/components/SingleLineInputField';

export type KeywordBlockListKeywordComposerProps = {
  keywords: string;
  onChangeKeywords: (keywords: string) => void;
  onAddKeyword: () => Promise<void>;
  errorMessage: string | null;
  disableSubmit: boolean;
} & WithTranslationsProps;

const KeywordBlockListKeywordComposer = ({
  keywords,
  onChangeKeywords,
  onAddKeyword,
  errorMessage,
  disableSubmit,
  translate
}: KeywordBlockListKeywordComposerProps): JSX.Element | null => {
  const handleAdd = async () => {
    if (keywords.trim()) {
      await onAddKeyword();
    }
  };

  return (
    <div className='keyword-block-list-keyword-composer-container section-content remove-panel'>
      <div className='keyword-block-list-sub-header flex items-center justify-between'>
        {translate('Heading.AddWordToBlockList')}
      </div>
      <SingleLineInputField
        id='new-keyword'
        value={keywords}
        onChange={onChangeKeywords}
        maxLength={groupContentModerationConstants.limits.maxAddBlockedKeywordInputLength}
        errorMessage={errorMessage}
        placeholder={translate('Label.AddKeywordBlockListPlaceholder')}
        showCharacterCount
      />
      <button
        type='button'
        className='btn-secondary-md keyword-block-list-add-keyword-button'
        onClick={handleAdd}
        disabled={!keywords.trim() || disableSubmit}>
        {translate('Action.Add')}
      </button>
    </div>
  );
};

export default withTranslations(KeywordBlockListKeywordComposer, groupsConfig);
