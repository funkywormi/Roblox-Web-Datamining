import React from 'react';
import { Button } from 'react-style-guide';
import { Thumbnail2d, ThumbnailTypes, ThumbnailAvatarHeadshotSize } from 'roblox-thumbnails';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { urlQueryConstants } from '../../common/constants/urlConstants';
import { accountSelectorConfig } from '../translation.config';
import accountSelectorStrings from '../constants/accountSelectorConstants';

export type accountSelectionProps = {
  userId: number;
  username: string;
  displayName?: string;
  onAccountSelection: (userId: number) => void;
  disabled: boolean;
  translate: WithTranslationsProps['translate'];
};

export const AccountSelection = ({
  userId,
  username,
  displayName,
  onAccountSelection,
  disabled,
  translate
}: accountSelectionProps): JSX.Element => {
  return (
    <li className='account-selection-list-item'>
      <div className='account-selection'>
        <div className='account-selection-thumbnail'>
          <Thumbnail2d
            containerClass='avatar-card-image'
            type={ThumbnailTypes.avatarHeadshot}
            targetId={userId}
            size={ThumbnailAvatarHeadshotSize.size48}
          />
        </div>
        <div className='account-selection-name-container'>
          <p className='account-selection-displayname'>{displayName || username}</p>
          <p className='account-selection-username'>{urlQueryConstants.atSign + username}</p>
        </div>
        {!disabled && (
          <div className='account-selection-button-container'>
            <Button
              className='account-selection-button'
              variant='secondary'
              size='sm'
              onClick={e => onAccountSelection(userId)}>
              {translate(accountSelectorStrings.ActionSelect)}
            </Button>
          </div>
        )}
      </div>
    </li>
  );
};

export default withTranslations(AccountSelection, accountSelectorConfig);
