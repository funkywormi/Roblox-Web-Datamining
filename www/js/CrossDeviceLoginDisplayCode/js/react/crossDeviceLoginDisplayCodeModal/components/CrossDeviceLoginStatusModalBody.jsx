import React from 'react';
import PropTypes from 'prop-types';

function CrossDeviceLoginStatusModalBody({ accountName, accountPictureUrl, translate }) {
  return (
    <div>
      <div>
        {accountPictureUrl ? (
          <img
            className='cross-device-login-avatar-thumbnail'
            src={accountPictureUrl}
            alt='ph-avatar-headshot'
          />
        ) : (
          <div className='cross-device-login-display-code-modal-image cross-device-login-ph-avatar-image' />
        )}
        <div className='cross-device-login-device-prompt-text font-header-2'>
          {translate('Label.ConfirmOnDevice')}
        </div>
        <div className='cross-device-login-instruction-text font-caption-header'>
          {translate('Label.WebLogginInAs')} <span> {accountName} </span>
        </div>
      </div>
    </div>
  );
}

CrossDeviceLoginStatusModalBody.propTypes = {
  translate: PropTypes.func.isRequired,
  accountName: PropTypes.func.isRequired,
  accountPictureUrl: PropTypes.func.isRequired
};

export default CrossDeviceLoginStatusModalBody;
