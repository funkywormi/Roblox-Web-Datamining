import React, { useState, useEffect } from 'react';
import { EnvironmentUrls } from 'Roblox';
import PropTypes from 'prop-types';
import { eventStreamService } from 'core-roblox-utilities';
import CrossDeviceLoginDisplayCodeModal from '../components/CrossDeviceLoginDisplayCodeModal';
import {
  createNewCode,
  pullCrossDeviceLoginStatus,
  cancelCrossDeviceLoginCode
} from '../services/crossDeviceLoginDisplayCodeService';

import events from '../constants/eventConstants';

// to construct QR image url
const { apiGatewayUrl } = EnvironmentUrls;

// pulling cross device login code status every 5 seconds
const CODESTATUSPULLINGINTERVAL = 5000;

function CrossDeviceLoginDisplayCodeModalContainer({ translate }) {
  const [isModalOpen, setModalOpen] = useState(false);
  const [code, setCode] = useState('');
  const [qrUrl, setQrUrl] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountPictureUrl, setAccountPictureUrl] = useState('');

  const setQrUrlFromPath = imagePath => {
    if (imagePath) {
      setQrUrl(`${apiGatewayUrl}/auth-token-service${imagePath}`);
    }
  };

  window.addEventListener(
    'OpenCrossDeviceLoginDisplayCodeModal',
    event => {
      setCode(event.detail.code);
      setPrivateKey(event.detail.privateKey);
      setQrUrlFromPath(event.detail.imagePath);
      eventStreamService.sendEventWithTarget(events.showModal.type, events.showModal.context, {});
      setModalOpen(true);
    },
    false
  );

  const handleModalDismiss = cancelCode => {
    setCode('');
    setQrUrl('');
    setPrivateKey('');
    setAccountName('');
    setAccountPictureUrl('');
    setModalOpen(false);
    return cancelCode ? cancelCrossDeviceLoginCode({ code: cancelCode }) : null;
  };

  const refreshCode = codeBody => {
    setCode(codeBody.code);
    setPrivateKey(codeBody.privateKey);
    setQrUrlFromPath(codeBody.imagePath);
    setAccountName('');
    setAccountPictureUrl('');
  };

  useEffect(() => {
    let interval = null;
    if (code && privateKey) {
      interval = setInterval(async () => {
        const params = {
          code,
          privateKey
        };
        try {
          const { data: crossDeviceLoginData } = await pullCrossDeviceLoginStatus(params);
          if (crossDeviceLoginData?.status === 'Cancelled') {
            const { data: codeBody } = await createNewCode();
            refreshCode(codeBody);
          }
          if (crossDeviceLoginData?.status === 'UserLinked') {
            if (accountName === '') {
              eventStreamService.sendEventWithTarget(
                events.showProfile.type,
                events.showProfile.context,
                {}
              );
            }
            setAccountName(crossDeviceLoginData.accountName || 'unknown');
            setAccountPictureUrl(crossDeviceLoginData.accountPictureUrl);
          }
          if (crossDeviceLoginData?.status === 'Validated') {
            const loginParams = {
              ctype: 'AuthToken',
              code,
              privateKey
            };
            const event = new CustomEvent('OnCrossDeviceCodeValidated', {
              detail: loginParams
            });
            window.dispatchEvent(event);
            handleModalDismiss();
            return clearInterval(interval);
          }
        } catch (e) {
          // refresh when code expires.
          const { data: codeBody } = await createNewCode();
          refreshCode(codeBody);
        }
        return false;
      }, CODESTATUSPULLINGINTERVAL);
    }
    return () => clearInterval(interval);
  }, [accountName, code, privateKey]);

  return (
    <CrossDeviceLoginDisplayCodeModal
      show={isModalOpen}
      code={code}
      qrUrl={qrUrl}
      accountName={accountName}
      accountPictureUrl={accountPictureUrl}
      onHide={() => handleModalDismiss(code)}
      translate={translate}
    />
  );
}

CrossDeviceLoginDisplayCodeModalContainer.propTypes = {
  translate: PropTypes.func.isRequired
};

export default CrossDeviceLoginDisplayCodeModalContainer;
