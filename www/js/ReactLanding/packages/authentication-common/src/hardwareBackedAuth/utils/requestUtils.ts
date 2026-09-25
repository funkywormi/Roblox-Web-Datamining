import { cryptoUtil, dataStores } from "@rbx/core-scripts/legacy/core-roblox-utilities";

import { getDeviceMeta } from "@rbx/core-scripts/meta/device";
import { TLoginParams, TLoginWithVerificationTokenParams } from "../../types/loginTypes";

import { TSignupParams } from "../../types/signupTypes";

import { getServerNonce } from "../services/hbaService";

import { sendSAIMissingEvent, sendSAISuccessEvent } from "../../utils/eventUtils";
import { getErrorMessage } from "./errorUtil";
import { storeClientKeyPair } from "./storeUtils";

const { getHbaMeta } = cryptoUtil;

const hbaMeta = getHbaMeta();

const {
  hbaIndexedDBName,
  hbaIndexedDBObjStoreName,
  hbaIndexedDBKeyName,
  isSecureAuthenticationIntentEnabled,
} = hbaMeta;

const { hbacIndexedDB } = dataStores;

const SEPARATOR = "|";

type TAuthParamsCryptoKeyPairComposite<
  T extends TLoginParams | TSignupParams | TLoginWithVerificationTokenParams,
> = {
  authParams: T;
  clientKeyPair?: CryptoKeyPair;
};
/**
 * Build signup & login request with SecureAuthIntent
 *
 * @returns an auth request parameter
 */
export const buildAuthParamsWithSecureAuthIntentAndClientKeyPair = async <
  T extends TLoginParams | TSignupParams | TLoginWithVerificationTokenParams,
>(
  params: T,
): Promise<TAuthParamsCryptoKeyPairComposite<T>> => {
  if (!isSecureAuthenticationIntentEnabled || getDeviceMeta()?.isInApp) {
    sendSAIMissingEvent({ message: "FeatureDisabled" });
    return {
      authParams: params,
    };
  }

  try {
    // prerequisite: get serverNonce
    const serverNonce = await getServerNonce();
    if (!serverNonce) {
      console.warn("No hba server nonce available.");
      sendSAIMissingEvent({ message: "NonceUnavailable" });
      return {
        authParams: params,
      };
    }
    // step 1 try to get or generate clientKeyPair
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    let clientKeyPair = {} as CryptoKeyPair;
    if (hbaIndexedDBName && hbaIndexedDBObjStoreName && hbaIndexedDBKeyName) {
      try {
        clientKeyPair =
          (await hbacIndexedDB.getCryptoKeyPair(
            hbaIndexedDBName,
            hbaIndexedDBObjStoreName,
            hbaIndexedDBKeyName,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
          )) ?? ({} as CryptoKeyPair);
      } catch {
        // return empty keyPair upon exception
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        clientKeyPair = {} as CryptoKeyPair;
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!clientKeyPair || Object.keys(clientKeyPair).length === 0) {
      clientKeyPair = await cryptoUtil.generateSigningKeyPairUnextractable();
      // For reliability, always re-create the IDB if we could not get a key pair.
      // Note that `deleteCryptoDB` never throws.
      await hbacIndexedDB.deleteCryptoDB();
      await storeClientKeyPair(clientKeyPair);
      clientKeyPair =
        (await hbacIndexedDB.getCryptoKeyPair(
          hbaIndexedDBName,
          hbaIndexedDBObjStoreName,
          hbaIndexedDBKeyName,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        )) ?? ({} as CryptoKeyPair);
    }
    // step 2 sign the payload with client private key.
    const clientPublicKey = await cryptoUtil.exportPublicKeyAsSpki(clientKeyPair.publicKey);
    const clientEpochTimestamp = Math.floor(Date.now() / 1000);
    const payload = [clientPublicKey, clientEpochTimestamp, serverNonce].join(SEPARATOR);

    const saiSignature = await cryptoUtil.sign(clientKeyPair.privateKey, payload);
    const secureAuthIntent = {
      clientPublicKey,
      clientEpochTimestamp,
      serverNonce,
      saiSignature,
    };
    // step 3 attach it to a login params
    const authParams = params;
    authParams.secureAuthenticationIntent = secureAuthIntent;
    sendSAISuccessEvent();
    return {
      authParams: params,
      clientKeyPair,
    };
  } catch (e) {
    sendSAIMissingEvent({ message: getErrorMessage(e) });
    return {
      authParams: params,
    };
  }
};

export default {
  buildAuthParamsWithSecureAuthIntentAndClientKeyPair,
};
