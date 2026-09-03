import React, { Fragment, useEffect, useState } from 'react';
import { DialogBody, DialogTitle, IconButton } from '@rbx/foundation-ui';
import { Button, Modal } from 'react-style-guide';
import { WithTranslationsProps } from 'react-utilities';
import { TUserData } from '../../common/types/userTypes';
import AccountSelection from './AccountSelection';
import {
  accountSwitcherStrings,
  commonUiTranslationKeys,
  isLogoutAllButtonInSwitcherEnabled
} from '../constants/accountSwitcherConstants';
import AddAccountRow from './AddAccountRow';
import FoundationAccountSwitcherList, {
  AccountSwitcherListVariant
} from './FoundationAccountSwitcherList';
import { sendShowAccountSwitcherShownEvent } from '../services/eventService';

export type accountSwitcherModalProps = {
  users: TUserData[];
  isAccountLimitReached: boolean;
  onAccountSelection: (userId: number) => void;
  handleAddAccount: () => void;
  suppressAddAccountRow?: boolean;
  handleShowLogoutAllModal: () => void;
  handleModalDismiss: () => void;
  activeUser?: TUserData;
  accountListVariant?: AccountSwitcherListVariant;
  isAccountListVariantResolved?: boolean;
  translate: WithTranslationsProps['translate'];
};

export const AccountSwitcherModal = ({
  users,
  isAccountLimitReached,
  onAccountSelection,
  handleAddAccount,
  suppressAddAccountRow = false,
  handleShowLogoutAllModal,
  handleModalDismiss,
  activeUser,
  accountListVariant = 'legacy',
  isAccountListVariantResolved = true,
  translate
}: accountSwitcherModalProps): JSX.Element => {
  const [hasLogged, setHasLogged] = useState<boolean>(false);

  useEffect(() => {
    if (!hasLogged && isAccountListVariantResolved) {
      const userIds = users.map(user => user.id).join(',');
      sendShowAccountSwitcherShownEvent(userIds, {
        accountSwitcherComponentVariant: accountListVariant,
        hasActiveAccount: activeUser != null ? 1 : 0,
        switchableAccountCount: users.length
      });
      setHasLogged(true);
    }
  }, [accountListVariant, activeUser, hasLogged, isAccountListVariantResolved, users]);

  const accountSwitcherList =
    accountListVariant === 'foundation' ? (
      <FoundationAccountSwitcherList
        activeUser={activeUser}
        handleAddAccount={handleAddAccount}
        isAccountLimitReached={isAccountLimitReached}
        onAccountSelection={onAccountSelection}
        suppressAddAccountRow={suppressAddAccountRow}
        translate={translate}
        users={users}
      />
    ) : (
      <ul className='account-switcher-list '>
        {activeUser && (
          <li className='account-selection-list-item'>
            <AccountSelection
              key={activeUser.id}
              userId={activeUser.id}
              username={activeUser.name}
              displayName={activeUser.displayName}
              onAccountSelection={onAccountSelection}
              translate={translate}
              showIcon
            />
          </li>
        )}
        {users.map(user => (
          <li className='account-selection-list-item' key={user.id}>
            <AccountSelection
              key={user.id}
              userId={user.id}
              username={user.name}
              displayName={user.displayName}
              onAccountSelection={onAccountSelection}
              translate={translate}
              showIcon={false}
            />
          </li>
        ))}
        {!isAccountLimitReached && !suppressAddAccountRow && (
          <li className='account-selection-list-item'>
            <AddAccountRow handleAddAccount={handleAddAccount} translate={translate} />
          </li>
        )}
      </ul>
    );

  const modalBody = (
    <div
      className={
        accountListVariant === 'foundation'
          ? 'account-switcher-foundation-section modal-section'
          : 'section-content modal-section'
      }>
      {isAccountLimitReached && (
        <p className='account-switcher-help-text'>
          {translate(accountSwitcherStrings.DescriptionAccountLimit)}
        </p>
      )}
      {accountSwitcherList}
    </div>
  );

  if (accountListVariant === 'foundation') {
    return (
      <Fragment>
        <div className='account-switcher-foundation-header'>
          <IconButton
            ariaLabel={translate(commonUiTranslationKeys.ActionClose)}
            className='account-switcher-foundation-close'
            icon='icon-regular-x'
            onClick={handleModalDismiss}
            size='Large'
            variant='Utility'
          />
          <DialogTitle className='account-switcher-foundation-title'>
            {translate(accountSwitcherStrings.HeadingSwitchAccount)}
          </DialogTitle>
          <span className='account-switcher-foundation-header-spacer' />
        </div>
        <DialogBody className='account-switcher-foundation-body'>{modalBody}</DialogBody>
      </Fragment>
    );
  }

  return (
    <Fragment>
      <Modal.Header
        className='account-switcher-header'
        title={translate(accountSwitcherStrings.HeadingSwitchAccount)}
        onClose={handleModalDismiss}
      />
      <Modal.Body>{modalBody}</Modal.Body>
    </Fragment>
  );
};

export default AccountSwitcherModal;
