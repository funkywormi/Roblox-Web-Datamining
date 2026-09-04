import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import AccountRecoveryModal from '../components/AccountRecoveryModal';
import urlConstants from '../constants/urlConstants';
import events from '../constants/eventStreamConstants';
import {
  getExperimentEnrollment,
  sendAccountRecoveryEvent
} from '../services/accountRecoveryModalService';

function AccountRecoveryModalContainer({ translate }) {
  const [isModalOpen, setModalOpen] = useState(false);
  const [requiredFailuresToShowPrompt, setRequiredFailuresToShowPrompt] = useState(-1);

  useEffect(() => {
    getExperimentEnrollment(requiredFailures => {
      setRequiredFailuresToShowPrompt(requiredFailures);
    });
  }, []);

  window.addEventListener(
    'OpenAccountRecoveryModal',
    event => {
      // -1 indicates that modal will not open no matter how many failed attempts
      if (requiredFailuresToShowPrompt > -1 && event.detail >= requiredFailuresToShowPrompt) {
        sendAccountRecoveryEvent(events.modalShown);
        setModalOpen(true);
      }
    },
    false
  );

  function navigateToForgotCredentials() {
    sendAccountRecoveryEvent(events.yesButtonClick);
    window.location.href = urlConstants.forgotCredentials;
  }

  function handleModalDismiss() {
    sendAccountRecoveryEvent(events.noButtonClick);
    setModalOpen(false);
  }

  return (
    <AccountRecoveryModal
      show={isModalOpen}
      onPrimaryAction={() => navigateToForgotCredentials()}
      onHide={() => handleModalDismiss()}
      translate={translate}
    />
  );
}

AccountRecoveryModalContainer.propTypes = {
  translate: PropTypes.func.isRequired
};

export default AccountRecoveryModalContainer;
