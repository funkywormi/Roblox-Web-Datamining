import React from 'react';
import PropTypes from 'prop-types';
import { qrHelpUrl } from '../constants/urlConstants';

function CrossDeviceLoginCodeModalBody({
  code,
  qrUrl,
  translate,
  altTitle,
  altInstruction,
  altDeviceSpecificInstruction
}) {
  const loginInstructions = altInstruction || translate('Label.LoginInstructionsV2');
  let completeLoginInstructions;
  if (altDeviceSpecificInstruction) {
    completeLoginInstructions = (
      <div
        className='cross-device-login-device-specific-instruction-text font-caption-header'
        dangerouslySetInnerHTML={{
          __html: `${loginInstructions}<br>${altDeviceSpecificInstruction}`
        }}
      />
    );
  } else {
    completeLoginInstructions = (
      <div
        className='cross-device-login-instruction-text font-caption-header'
        dangerouslySetInnerHTML={{
          __html: `${loginInstructions}<br>${translate('Label.LoginLocationV2')}`
        }}
      />
    );
  }

  const qrCodeView = () => {
    return (
      <div>
        <div>
          <b>{translate('Label.QrHeader')}</b>
        </div>
        <img src={qrUrl} alt='' className='cross-device-login-display-qr-code-image' />
        <div className='cross-device-login-instruction-text font-caption-header'>
          {translate('Label.QrInstructions')}
          <br />
          <a
            href={qrHelpUrl}
            target='_blank'
            rel='noreferrer'
            className='text-link cross-device-login-instruction-text'>
            <u>{translate('Label.QrTroubleshooting')}</u>
          </a>
        </div>
        <div className='cross-device-login-qr-header-text'>
          <b>{translate('Label.CodeHeader')}</b>
        </div>
        <div className='font-title'>{code}</div>
        <div className='cross-device-login-instruction-text font-caption-header'>
          {completeLoginInstructions}
        </div>
      </div>
    );
  };

  const textCodeView = () => {
    return (
      <div>
        <div className='cross-device-login-display-code-modal-image' />
        <div className='font-title'>{code}</div>
        <div className='cross-device-login-device-prompt-text font-header-2'>
          {altTitle || translate('Label.DevicePrompt')}
        </div>
        <div className='cross-device-login-instruction-text font-caption-header'>
          {completeLoginInstructions}
        </div>
      </div>
    );
  };

  return qrUrl ? qrCodeView() : textCodeView();
}

CrossDeviceLoginCodeModalBody.defaultProps = {
  altTitle: '',
  altInstruction: '',
  altDeviceSpecificInstruction: ''
};

CrossDeviceLoginCodeModalBody.propTypes = {
  translate: PropTypes.func.isRequired,
  code: PropTypes.string.isRequired,
  qrUrl: PropTypes.string.isRequired,
  altTitle: PropTypes.string,
  altInstruction: PropTypes.string,
  altDeviceSpecificInstruction: PropTypes.string
};

export default CrossDeviceLoginCodeModalBody;
