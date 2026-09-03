import React, { useState } from 'react';
import { Icon } from '@rbx/foundation-ui';
import { Thumbnail2d, ThumbnailAvatarHeadshotSize, ThumbnailTypes } from 'roblox-thumbnails';
import { WithTranslationsProps } from 'react-utilities';
import { TUserData } from '../../common/types/userTypes';
import { urlQueryConstants } from '../../common/constants/urlConstants';
import { accountSwitcherStrings } from '../constants/accountSwitcherConstants';

export type AccountSwitcherListVariant = 'legacy' | 'foundation';

export type FoundationAccountSwitcherListProps = {
  activeUser?: TUserData;
  handleAddAccount: () => void;
  isAccountLimitReached: boolean;
  onAccountSelection: (userId: number) => void;
  suppressAddAccountRow?: boolean;
  translate: WithTranslationsProps['translate'];
  users: TUserData[];
};

type FoundationAccountSwitcherAccountRowProps = {
  isActive?: boolean;
  onAccountSelection: (userId: number) => void;
  user: TUserData;
};

const FoundationAccountSwitcherAccountContent = ({
  isActive = false,
  user
}: {
  isActive?: boolean;
  user: TUserData;
}): JSX.Element => (
  <React.Fragment>
    <div className='account-selection-thumbnail'>
      <Thumbnail2d
        containerClass='avatar-card-image'
        type={ThumbnailTypes.avatarHeadshot}
        targetId={user.id}
        size={ThumbnailAvatarHeadshotSize.size60}
        includeProfileFrame
      />
    </div>
    <div className='account-selection-name-container'>
      <p className='account-selection-displayname'>{user.displayName || user.name}</p>
      <p className='account-selection-username'>
        {user.name ? urlQueryConstants.atSign + user.name : ''}
      </p>
    </div>
    {isActive && (
      <Icon
        className='account-switcher-foundation-check content-system-success'
        name='icon-regular-circle-check'
        size='Medium'
      />
    )}
  </React.Fragment>
);

const FoundationAccountSwitcherAccountRow = ({
  isActive = false,
  onAccountSelection,
  user
}: FoundationAccountSwitcherAccountRowProps): JSX.Element => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isActive) {
    return (
      <li className='account-selection-list-item'>
        <div
          aria-current='true'
          className='active-account account-switcher-foundation-row'
          data-testid='foundation-account-switcher-active-account-row'>
          <FoundationAccountSwitcherAccountContent isActive user={user} />
        </div>
      </li>
    );
  }

  const handleSelect = () => {
    if (!isSubmitting) {
      setIsSubmitting(true);
      try {
        onAccountSelection(user.id);
      } catch {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <li className='account-selection-list-item'>
      <button
        className='account-selection account-switcher-foundation-row'
        data-testid='foundation-account-switcher-account-row'
        onClick={handleSelect}
        type='button'>
        <FoundationAccountSwitcherAccountContent user={user} />
        {isSubmitting && <div className='spinner spinner-sm spinner-no-margin spinner-block' />}
      </button>
    </li>
  );
};

const FoundationAccountSwitcherAddAccountRow = ({
  handleAddAccount,
  translate
}: {
  handleAddAccount: () => void;
  translate: WithTranslationsProps['translate'];
}): JSX.Element => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelect = () => {
    setIsSubmitting(true);
    handleAddAccount();
  };

  return (
    <li className='account-selection-list-item'>
      <button
        className='account-selection account-switcher-foundation-row'
        data-testid='foundation-account-switcher-add-account-row'
        onClick={handleSelect}
        type='button'>
        <div className='account-switcher-icon-add'>
          <span className='icon-plus' />
        </div>
        <div className='account-selection-name-container'>
          <p className='account-selection-add-account'>
            {translate(accountSwitcherStrings.ActionAddAccount)}
          </p>
        </div>
        {isSubmitting && <div className='spinner spinner-sm spinner-block' />}
      </button>
    </li>
  );
};

const FoundationAccountSwitcherList = ({
  activeUser,
  handleAddAccount,
  isAccountLimitReached,
  onAccountSelection,
  suppressAddAccountRow = false,
  translate,
  users
}: FoundationAccountSwitcherListProps): JSX.Element => (
  <ul className='account-switcher-list account-switcher-foundation-list'>
    {activeUser && (
      <FoundationAccountSwitcherAccountRow
        isActive
        key={activeUser.id}
        onAccountSelection={onAccountSelection}
        user={activeUser}
      />
    )}
    {users.map(user => (
      <FoundationAccountSwitcherAccountRow
        key={user.id}
        onAccountSelection={onAccountSelection}
        user={user}
      />
    ))}
    {!isAccountLimitReached && !suppressAddAccountRow && (
      <FoundationAccountSwitcherAddAccountRow
        handleAddAccount={handleAddAccount}
        translate={translate}
      />
    )}
  </ul>
);

export default FoundationAccountSwitcherList;
