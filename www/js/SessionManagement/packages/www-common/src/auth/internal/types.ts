export type HbaMeta = {
  isSecureAuthenticationIntentEnabled: boolean;
  isBoundAuthTokenEnabled: boolean;
  boundAuthTokenWhitelist: string;
  boundAuthTokenExemptlist: string;
  hbaIndexedDBName: string;
  hbaIndexedDBObjStoreName: string;
  hbaIndexedDBKeyName: string;
  hbaIndexedDBVersion: number;
  batEventSampleRate: number;
};

// Note: ideally we return an error type instead but given the way dependencies
// are consumed in web-frontend by default (globals), this is not a safe type to change.
//
// One update to this public interface that's backwards-incompatible and all webapps break
// at the same time (either at compile OR runtime, depending on the change).
export type SecureAuthIntent = {
  clientPublicKey: string;
  clientEpochTimestamp: number;
  serverNonce: string;
  saiSignature: string;
};

export enum BatGenerationErrorKind {
  RequestExempt = "RequestExempt",
  RequestExemptError = "RequestExemptError",
  GetKeyPairFailed = "GetKeyPairFailed",
  UpdateKeyPairFailed = "UpdateKeyPairFailed",
  NoKeyPairFound = "NoKeyPairFound",
  RequestBodyHashFailed = "RequestBodyHashFailed",
  SignatureFailed = "SignatureFailed",
  Unknown = "Unknown",
}

export type BatGenerationErrorInfo = {
  message: string;
  kind: BatGenerationErrorKind;
};

export type SaiGenerationErrorInfo = {
  message: string;
  // TODO: Add discrete error kinds here...
};
