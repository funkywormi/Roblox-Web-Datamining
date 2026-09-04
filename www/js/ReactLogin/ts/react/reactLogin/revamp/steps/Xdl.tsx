import React, { useEffect } from 'react';
import { CrossDeviceLoginDisplayCodeService } from 'Roblox';
import { CredentialType } from '../../../common/types/loginTypes';
import { useLoginMutation } from '../common';
import { backToLogin } from '../loginState';
import { TLoginWithAuthTokenRenderEvent } from '../../../common/types/crossDeviceLoginTypes';

export const xdlListener = (login: ReturnType<typeof useLoginMutation>): EventListener =>
  ((event: TLoginWithAuthTokenRenderEvent) => {
    if (event.detail && !login.isPending) {
      const { code, privateKey } = event.detail;
      const credential = {
        type: CredentialType.AuthToken,
        value: code,
        password: privateKey
      };
      login.mutate({ credential });
    }
  }) as EventListener;

export const XdlModalContainer = (): JSX.Element => (
  <div id='crossDeviceLoginDisplayCodeModal-container' />
);

// TODO: consider redesigning this as a form step instead of a modal
const Xdl = (): null => {
  useEffect(() => {
    if (CrossDeviceLoginDisplayCodeService == null) {
      backToLogin(); // TODO: error message
    } else {
      // TODO: cross device login needs a callback for when it is cancelled.
      CrossDeviceLoginDisplayCodeService.openModal();
      backToLogin();
    }
  }, []);

  return null;
};

export default Xdl;
