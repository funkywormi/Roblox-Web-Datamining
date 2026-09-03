import React from 'react';
import { WithTranslationsProps, withTranslations } from 'react-utilities';
import { Creator } from '../../constants/types';
import translationConfig from '../../translation.config';

export type CreatorsListComponentProps = {
  creators: Creator[];
  selectedCreator?: Creator | null;
  creatorNameInputValue: string;
  setCreatorNameInputValue: (newValue: string) => void;
  robloxUserId?: number;
  isPhone: boolean;
  isUGCOnly: boolean;
  onCreatorChanged: (creator: Creator) => void;
  applyCreatorNameToQuery: (newCreatorName?: string | null) => void;
  customText: number | 'custom';
  isSearchOnBlurEnabled: boolean;
};

function CreatorFilter({
  creators,
  selectedCreator,
  creatorNameInputValue,
  setCreatorNameInputValue,
  robloxUserId,
  isUGCOnly,
  isPhone,
  onCreatorChanged,
  applyCreatorNameToQuery,
  customText,
  isSearchOnBlurEnabled,
  translate
}: CreatorsListComponentProps & WithTranslationsProps): JSX.Element {
  const renderCreatorFilter = (creator: Creator) => {
    const showInputField =
      creator.userId === customText || (typeof creator.userId === 'number' && creator.userId >= 2);

    return (
      <li
        key={creator.userId}
        className='radio top-border font-caption-body'
        style={{
          display: creator.userId === robloxUserId && isUGCOnly ? 'none' : 'block'
        }}>
        <input
          type='radio'
          name='radio-creator'
          id={`radio-creator-${creator.userId}`}
          checked={selectedCreator?.userId === creator.userId}
          onChange={() => onCreatorChanged(creator)}
        />
        {!showInputField && (
          <label htmlFor={`radio-creator-${creator.userId}`}>{creator.name}</label>
        )}
        {showInputField && (
          <label htmlFor='radio-creator-custom' className='has-input creator-name-input'>
            <input
              className='form-control input-field username-input font-caption-body'
              type='text'
              name='creatorName'
              placeholder={translate('Label.CreatorName')}
              maxLength={20}
              value={creatorNameInputValue}
              onChange={e => {
                const newValue = e.target.value;
                setCreatorNameInputValue(newValue);
                if (isSearchOnBlurEnabled) {
                  applyCreatorNameToQuery(newValue);
                }
              }}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  applyCreatorNameToQuery(creatorNameInputValue);
                }
              }}
              onFocus={() => {
                if (selectedCreator?.userId !== creator.userId) {
                  onCreatorChanged(creator);
                }
              }}
              required={isPhone && selectedCreator?.userId === creator.userId}
            />
            <button
              type='button'
              className='btn-secondary-xs btn-update-filter'
              disabled={!creatorNameInputValue.length}
              onClick={() => {
                applyCreatorNameToQuery(creatorNameInputValue);
              }}>
              {translate('Action.Go')}
            </button>
          </label>
        )}
      </li>
    );
  };
  return <ul>{creators.map(creator => renderCreatorFilter(creator))}</ul>;
}

export default withTranslations(CreatorFilter, translationConfig);
