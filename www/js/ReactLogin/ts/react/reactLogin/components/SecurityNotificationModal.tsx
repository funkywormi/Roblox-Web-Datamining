import React from 'react';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { Modal } from 'react-style-guide';
import { loginTranslationConfig } from '../translation.config';
import { FeatureLoginPage } from '../../common/constants/translationConstants';
import '../../../../css/login/securityNotificationModal.scss';
import { navigateToForgotCredentialsPage } from '../utils/loginUtils';

export type securityNotificationModalProps = {
  credentialValue: string;
  translate: WithTranslationsProps['translate'];
};

export const SecurityNotificationModal = ({
  credentialValue,
  translate
}: securityNotificationModalProps): JSX.Element => {
  return (
    <Modal
      className='security-notification-modal'
      show
      backdrop='static'
      // The keyboard parameter prevents the modal from closing when the escape key is pressed
      keyboard={false}>
      <Modal.Header useBaseBootstrapComponent>
        <div />
        <span className='text-heading-small text-align-x-center padding-large'>
          {translate(FeatureLoginPage.HeadingSecurityNotification)}
        </span>
      </Modal.Header>
      <Modal.Body>
        <p className='text-center text-body-large modal-margin-bottom'>
          {translate(FeatureLoginPage.DescriptionRecoverYourAccount)}
        </p>
      </Modal.Body>
      <Modal.Footer>
        <div className='security-notification-modal-footer-buttons'>
          <button
            type='button'
            className='btn-growth-md security-notification-modal-footer-button update-email-button'
            aria-label={translate(FeatureLoginPage.ActionRecoverYourAccount)}
            onClick={() => {
              navigateToForgotCredentialsPage(credentialValue);
            }}>
            {translate(FeatureLoginPage.ActionRecoverYourAccount)}
          </button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default withTranslations(SecurityNotificationModal, loginTranslationConfig);
