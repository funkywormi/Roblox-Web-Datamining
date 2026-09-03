import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-style-guide';

function CrossDeviceCodeStatusModule({
  translate,
  DeviceInfo,
  Location,
  onAcceptClicked,
  onCancelClicked
}) {
  return (
    <div className='enter-code-container'>
      <h2>{translate('Heading.LoginAnotherDevice')}</h2>
      <div className='validate-code-container-right'>
        <p>
          {translate('Label.ConfirmationMessage1Web', {
            deviceInfo: DeviceInfo
          })}
        </p>
        <p>{Location}</p>
        <p className='validate-code-warning-text text-error'>
          {translate('Label.ConfirmationMessage2')}
        </p>
        <p>{translate('Label.ConfirmationMessage3')}</p>
      </div>
      <div className='validate-code-container-bottom'>
        <Button
          className='validate-code-cancel-button btn-secondary-md validate-code-cancel-btn'
          onClick={onCancelClicked}>
          {translate('Action.CancelLogin')}
        </Button>
        <Button
          className='validate-code-accept-button btn-primary-md validate-code-accept-btn'
          onClick={onAcceptClicked}>
          {translate('Label.Confirm')}
        </Button>
      </div>
    </div>
  );
}

CrossDeviceCodeStatusModule.propTypes = {
  translate: PropTypes.func.isRequired,
  DeviceInfo: PropTypes.string.isRequired,
  Location: PropTypes.string.isRequired,
  onAcceptClicked: PropTypes.func.isRequired,
  onCancelClicked: PropTypes.func.isRequired
};

export default CrossDeviceCodeStatusModule;
