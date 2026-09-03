import React, { useMemo, useState } from 'react';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { groupsConfig } from '../translation.config';
import { BlockedKeyword } from '../types';
import groupContentModerationConstants from '../constants/groupContentModerationConstants';
import keywordValidationHelper from '../utils/keywordValidationHelper';
import SingleLineInputField from '../../shared/components/SingleLineInputField';

export type KeywordBlockListKeywordItemProps = {
  keyword: BlockedKeyword;
  canEdit: boolean;
  onDelete: (keywordId: string) => Promise<void>;
  onSaveEdit: (keywordId: string, updatedKeyword: string) => Promise<void>;
  disableSubmit: boolean;
  errorMessage: string | null;
  resetError: (keywordId: string) => void;
  showDivider: boolean;
} & WithTranslationsProps;

const KeywordBlockListKeywordItem = ({
  keyword,
  canEdit,
  onDelete,
  onSaveEdit,
  disableSubmit,
  showDivider,
  errorMessage,
  resetError,
  translate
}: KeywordBlockListKeywordItemProps): JSX.Element | null => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingKeywordValue, setEditingKeywordValue] = useState<string>('');

  const editKeywordValidationError = useMemo(() => {
    if (!isEditing) return null;
    if (errorMessage) return errorMessage;

    const validationKey = keywordValidationHelper(editingKeywordValue, true);
    if (validationKey) {
      return translate(validationKey, {
        keyword: editingKeywordValue?.trim(),
        maxLength: groupContentModerationConstants.limits.maxBlockedKeywordLength,
        minLength: groupContentModerationConstants.limits.minBlockedKeywordLength
      });
    }

    return null;
  }, [editingKeywordValue, errorMessage, isEditing, translate]);

  const disableSaveEdit = useMemo(() => {
    const trimmedValue = editingKeywordValue.trim();
    return (
      disableSubmit ||
      !trimmedValue ||
      trimmedValue === keyword.keyword ||
      !!editKeywordValidationError
    );
  }, [disableSubmit, editKeywordValidationError, editingKeywordValue, keyword.keyword]);

  const handleInitiateEdit = () => {
    setIsEditing(true);
    setEditingKeywordValue(keyword.keyword);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    resetError(keyword.id);
    setEditingKeywordValue(keyword.keyword);
  };

  const handleSave = async () => {
    const trimmedValue = editingKeywordValue.trim();
    if (trimmedValue && trimmedValue !== keyword.keyword) {
      await onSaveEdit(keyword.id, trimmedValue);
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    await onDelete(keyword.id);
  };

  const onInputChange = (value: string) => {
    setEditingKeywordValue(value);
    resetError(keyword.id);
  };

  const renderEditView = () => (
    <div className='keyword-block-list-keyword-item-display flex justify-between items-start'>
      <SingleLineInputField
        id={`keyword-input-${keyword.id}`}
        className='keyword-item-edit-input grow'
        value={editingKeywordValue}
        onChange={onInputChange}
        maxLength={groupContentModerationConstants.limits.maxBlockedKeywordLength}
        errorMessage={editKeywordValidationError}
        showCharacterCount
      />
      <div className='keyword-block-list-keyword-item-actions flex items-center'>
        <button
          type='button'
          className='keyword-block-list-keyword-item-actions-primary-btn btn-secondary-md'
          disabled={disableSaveEdit}
          onClick={handleSave}>
          {translate('Action.Save')}
        </button>
        <button
          type='button'
          className='keyword-block-list-keyword-item-actions-secondary-btn btn-secondary-md'
          onClick={handleCancelEdit}>
          {translate('Action.Cancel')}
        </button>
      </div>
    </div>
  );

  const renderDisplayView = () => (
    <div className='keyword-block-list-keyword-item-display flex justify-between items-start'>
      <div className='keyword-block-list-keyword-item-text flex items-center'>
        <p>{keyword.keyword}</p>
      </div>
      {canEdit && (
        <div className='keyword-block-list-keyword-item-actions flex items-center'>
          <button
            type='button'
            className='keyword-block-list-keyword-item-actions-primary-btn btn-secondary-md'
            onClick={handleInitiateEdit}>
            {translate('Action.Edit') || 'Edit'}
          </button>
          <button
            type='button'
            className='keyword-block-list-keyword-item-actions-secondary-btn btn-secondary-md'
            disabled={disableSubmit}
            onClick={handleDelete}>
            {translate('Action.Delete')}
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className='keyword-block-list-keyword-item-container flex flex-col'>
      {isEditing ? renderEditView() : renderDisplayView()}
      {showDivider && <div className='rbx-divider' />}
    </div>
  );
};

export default React.memo(withTranslations(KeywordBlockListKeywordItem, groupsConfig));
