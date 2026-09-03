import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { Button, Modal } from 'react-style-guide';
import { CurrentUser, ExperimentationService } from 'Roblox';
import CrossDeviceCodeInputModule from '../components/CrossDeviceCodeInputModule';
import CrossDeviceCodeStatusModule from '../components/CrossDeviceCodeStatusModule';
import events from '../constants/ConfirmCodeEventStreamConstants';
import displayStateConstants from '../constants/displayStateConstants';
import { codeInvalidErrorValue, invalidLocationErrorValue } from '../constants/urlConstants';
import {
  cancelCode,
  enterCode,
  getExperimentEnrollments,
  getMetadata,
  sendCodeConfirmEvent,
  validateCode
} from '../services/confirmCodeService';

function readLoggedInUsername() {
  if (
    CurrentUser?.isAuthenticated &&
    typeof CurrentUser.name === 'string' &&
    CurrentUser.name.length > 0
  ) {
    return CurrentUser.name;
  }
  return '';
}

function ConfirmCodeContainer({ translate }) {
  const [code, setCode] = useState('');
  const [deviceInfo, setDeviceInfo] = useState('');
  const [location, setLocation] = useState('');
  const [isSubmittingCode, setIsSubmittingCode] = useState(false);
  const [displayState, setDisplayState] = useState(displayStateConstants.CodeInput);
  const [isInputModalEnabled, setIsInputModalEnabled] = useState(false);
  const [isCompletedModalEnabled, setIsCompletedModalEnabled] = useState(false);
  const [isDisplayedFirstTime, SetIsDisplayedFirstTime] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [
    shouldNotClearCodeOnInvalidSubmission,
    setShouldNotClearCodeOnInvalidSubmission
  ] = useState(false);
  const [submitCodeError, setSubmitCodeError] = useState('');
  const [accountDisplayName, setAccountDisplayName] = useState(readLoggedInUsername);

  useEffect(() => {
    const name = readLoggedInUsername();
    if (name) {
      setAccountDisplayName(name);
    }
  }, []);

  if (isDisplayedFirstTime) {
    sendCodeConfirmEvent(events.pageLoad);
    SetIsDisplayedFirstTime(false);
  }

  async function SetExperimentState() {
    const metadata = await getMetadata();
    if (metadata?.data?.ShouldEnableCrossDeviceLoginConfirmerExperiments) {
      const enrollments = await getExperimentEnrollments();
      setShouldNotClearCodeOnInvalidSubmission(enrollments?.ShouldNotClearCodeOnInvalidSubmission);
    }
  }

  useEffect(() => SetExperimentState(), []);

  const handleInputChanged = input => {
    let cleanedInput = input.replace(/\s/g, '');
    cleanedInput = cleanedInput.toUpperCase();
    if (cleanedInput.length <= 6) {
      setCode(cleanedInput);
    }
  };

  const handleError = error => {
    if (error.data === invalidLocationErrorValue) {
      setErrorMessage(translate('Label.InvalidLocationError'));
    } else {
      setErrorMessage(translate('Label.CodeNotVerified'));
    }
    setIsInputModalEnabled(true);
  };

  const handleCodeSubmit = event => {
    setIsSubmittingCode(true);
    event.preventDefault();
    sendCodeConfirmEvent(events.buttonClick);
    enterCode(code).then(
      result => {
        if (result && result.deviceInfo != null) {
          setDeviceInfo(result.deviceInfo);
          setLocation(result.location);
          setDisplayState(displayStateConstants.Status);
          sendCodeConfirmEvent(events.approvedPageLoad);
        } else {
          setIsInputModalEnabled(true);
        }
        setIsSubmittingCode(false);
      },
      error => {
        setSubmitCodeError(error);
        handleError(error);
        setIsSubmittingCode(false);
      }
    );
  };

  function acceptClicked() {
    sendCodeConfirmEvent(events.approvedButtonClick);
    validateCode(code).then(
      result => {
        if (result === true) {
          sendCodeConfirmEvent(events.quickLoginSucceeded);
          setIsCompletedModalEnabled(true);
        } else {
          sendCodeConfirmEvent(events.quickLoginFailed);
          setIsInputModalEnabled(true);
        }
      },
      error => {
        sendCodeConfirmEvent(events.quickLoginFailed);
        handleError(error);
      }
    );
  }

  function tryClearCode() {
    if (shouldNotClearCodeOnInvalidSubmission && submitCodeError?.data === codeInvalidErrorValue) {
      return;
    }
    setCode('');
  }

  function cancelClicked() {
    cancelCode(code).then(() => {});
    setDisplayState(displayStateConstants.CodeInput);
    tryClearCode();
    setSubmitCodeError(null);
  }

  function tryAgainClicked() {
    setDisplayState(displayStateConstants.CodeInput);
    tryClearCode();
    setIsInputModalEnabled(false);
    setIsCompletedModalEnabled(false);
    setSubmitCodeError(null);
  }

  function bottomModuleRender() {
    switch (displayState) {
      case displayStateConstants.CodeInput:
        return (
          <CrossDeviceCodeInputModule
            translate={translate}
            accountDisplayName={accountDisplayName}
            handleCodeSubmit={handleCodeSubmit}
            handleCodeChange={handleInputChanged}
            shouldDisable={isSubmittingCode}
            codeValue={code}
          />
        );
      case displayStateConstants.Status:
        return (
          <CrossDeviceCodeStatusModule
            translate={translate}
            DeviceInfo={deviceInfo}
            Location={location}
            onAcceptClicked={acceptClicked}
            onCancelClicked={cancelClicked}
          />
        );
      default:
        return null;
    }
  }

  // Exposure Logging A/A Test setup
  useEffect(() => {
    const AccessLayer = 'Experimentation.ExposureTest.AccessLayer';
    const ExposureLayer = 'Experimentation.ExposureTest.ExposureLayer';
    ExperimentationService.getAllValuesForLayer(AccessLayer);
    ExperimentationService.getAllValuesForLayer(ExposureLayer).then(() => {
      ExperimentationService.logLayerExposure(ExposureLayer);
    });
  }, []);

  return (
    <div>
      <h1 className='enter-code-title'>{translate('Heading.QuickLogin')}</h1>
      <div className='content'>{bottomModuleRender()}</div>
      <Modal show={isInputModalEnabled} size='sm' scrollable='true' centered='true'>
        <Modal.Header useBaseBootstrapComponent>
          <div className='enter-code-modal-container'>
            <button type='button' className='enter-code-title-button' onClick={tryAgainClicked}>
              <span className='close icon-close' />
            </button>
            <Modal.Title id='enter-code-contained-modal-title-vcenter'>
              {translate('Response.LoginFail')}
            </Modal.Title>
          </div>
        </Modal.Header>
        <Modal.Body className='enter-code-modal-text'>{errorMessage}</Modal.Body>
        <Modal.Footer>
          <Button className='modal-button btn-cta-md enter-code-btn' onClick={tryAgainClicked}>
            {translate('Action.TryAgain')}
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal show={isCompletedModalEnabled} size='sm' scrollable='true' centered='true'>
        <Modal.Header useBaseBootstrapComponent>
          <div className='enter-code-modal-container'>
            <button type='button' className='enter-code-title-button' onClick={tryAgainClicked}>
              <span className='close icon-close' />
            </button>
            <Modal.Title id='enter-code-contained-modal-title-vcenter'>
              {translate('Response.LoginSuccess')}
            </Modal.Title>
          </div>
        </Modal.Header>
        <Modal.Body className='enter-code-modal-text'>
          {translate('Label.DeviceLoggedInWeb', { deviceLoggedIn: deviceInfo })}
          <br />
          {translate('Label.DeviceLoggedInLocation', { location })}
        </Modal.Body>
        <Modal.Footer>
          <Button className='modal-button btn-cta-md enter-code-btn' onClick={tryAgainClicked}>
            {translate('Label.OK')}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

ConfirmCodeContainer.propTypes = {
  translate: PropTypes.func.isRequired
};

export default ConfirmCodeContainer;
