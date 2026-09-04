import React, { Fragment, useState } from 'react';
import { Button, Modal } from 'react-style-guide';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { TUserData } from '../../common/types/accountSelectorTypes';
import AccountSelector from '../components/AccountSelector';
import accountSelectorStrings from '../constants/accountSelectorConstants';
import { accountSelectorConfig } from '../translation.config';

export type accountSelectorContainerProps = {
  users: TUserData[];
  invalidUsers: TUserData[];
  onAccountSelection: (accountSelectorUserId: number) => void;
  onAccountSelectorAbandoned: () => void;
  titleText: string;
  helpText?: string;
  translate: WithTranslationsProps['translate'];
};

export const AccountSelectorContainer = ({
  users,
  invalidUsers,
  onAccountSelection,
  onAccountSelectorAbandoned,
  titleText,
  helpText,
  translate
}: accountSelectorContainerProps): JSX.Element => {
  const [isModalOpen, setIsModalOpen] = useState(true);

  const handleModalDismiss = () => {
    onAccountSelectorAbandoned();
    setIsModalOpen(false);
  };

  const handleAccountSelectionAndCloseModal = (accountSelectorUserId: number): void => {
    onAccountSelection(accountSelectorUserId);
    setIsModalOpen(false);
  };

  const handleReturnToLogin = () => {
    window.dispatchEvent(new Event('closeEmailVerifyCodeModal'));
    handleModalDismiss();
  };

  return (
    <Modal
      className='account-selector-modal'
      show={isModalOpen}
      onHide={handleModalDismiss}
      size='lg'>
      {/* Modal expects children as a single element */}
      <Fragment>
        <Modal.Header
          className='account-selector-header'
          title={titleText}
          onClose={handleModalDismiss}
        />
        <Modal.Body>
          <Fragment>
            <p className='account-selector-help-text'>{helpText}</p>
            <AccountSelector
              users={users}
              onAccountSelection={handleAccountSelectionAndCloseModal}
              disabled={false}
              translate={translate}
            />
            {invalidUsers.length > 0 && (
              <Fragment>
                <p className='account-selector-help-text'>
                  {translate(accountSelectorStrings.ResponseChooseAnotherMethod)}
                </p>
                <AccountSelector
                  users={invalidUsers}
                  // no-op as disabled account selections will not have a button
                  // eslint-disable-next-line @typescript-eslint/no-empty-function
                  onAccountSelection={() => {}}
                  disabled
                  translate={translate}
                />
                <Button
                  className='account-selector-back-button'
                  variant='secondary'
                  size='sm'
                  onClick={handleReturnToLogin}>
                  {translate(accountSelectorStrings.LabelBackToLogin)}
                </Button>
              </Fragment>
            )}
          </Fragment>
        </Modal.Body>
      </Fragment>
    </Modal>
  );
};

export default withTranslations(AccountSelectorContainer, accountSelectorConfig);
