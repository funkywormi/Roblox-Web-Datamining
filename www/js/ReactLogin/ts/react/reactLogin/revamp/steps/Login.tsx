import { useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { fido2Util } from 'core-roblox-utilities';
import {
  getPasskeyChallenge,
  isPasskeyLoginEnabled
} from '../../../common/services/passkeyService';
import { CredentialType } from '../../../common/types/loginTypes';
import { sendPasskeyLoginPageLoadEvent } from '../../services/eventService';
import { signPasskeyCredential } from '../../utils/loginUtils';
import { useLoginMutation } from '../common';

// Since both normal login via the button and passkey share the same step (`login`),
// we need them to share the same `useLoginMutation` instance with the same `isPending` value.
// In the future, the login form will be moved here, or pass key will be a separate step from normal login.
const Login = ({ login }: { login: ReturnType<typeof useLoginMutation> }): null => {
  const isPassKeyEnabled = useQuery({
    queryKey: ['passkey-support'],
    queryFn: async () => {
      if (!isPasskeyLoginEnabled()) {
        return false;
      }
      if (window.PublicKeyCredential) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        const isCMA = await (window.PublicKeyCredential as any).isConditionalMediationAvailable?.();
        const isConditionalMediationSupported = Boolean(isCMA);
        sendPasskeyLoginPageLoadEvent(isConditionalMediationSupported);
        return isConditionalMediationSupported;
      }
      return false;
    },
    placeholderData: false
  });

  const passKeyAbortController = useRef<AbortController>(new AbortController());
  const passKeyLogin = useMutation({
    mutationFn: async () => {
      let challenge;
      try {
        challenge = await getPasskeyChallenge();
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
        return;
      }

      let signedCreds;
      try {
        signedCreds = await signPasskeyCredential(
          challenge.authenticationOptions,
          'conditional',
          passKeyAbortController.current.signal
        );
      } catch (e) {
        if (
          e != null &&
          typeof e === 'object' &&
          (e as Record<string, unknown>).name === 'AbortError'
        ) {
          return;
        }
        // eslint-disable-next-line no-console
        console.error(e);
        // backToLogin(); // TODO: error message
        throw e;
      }

      // TODO: what if signedCreds == null ?

      const code = fido2Util.formatCredentialAuthenticationResponseWeb(
        signedCreds as PublicKeyCredential
      );
      const credential = {
        type: CredentialType.Passkey,
        value: code,
        password: challenge.sessionId
      };
      await login.mutateAsync({ credential });
    },
    // We retry infinitely until success or unmount, so that the passkey option always appears on the login step.
    retry: Infinity,
    retryDelay: 100
  });

  useEffect(() => {
    if (isPassKeyEnabled.data && passKeyLogin.isIdle) {
      passKeyLogin.mutate();
    }
  }, [isPassKeyEnabled.data, passKeyLogin]);

  useEffect(
    () => () => {
      // Abort on unmount, since it would otherwise mess with 2sv.
      // Only the login step allows/supports pass key login anyways.
      passKeyAbortController.current.abort();
    },
    []
  );

  return null;
};

export default Login;
