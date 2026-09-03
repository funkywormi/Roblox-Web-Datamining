import { TranslationConfig } from "react-utilities";

export const NATIVE_RESPONSE_TIMEOUT_MILLISECONDS = 300000;

export const MAX_KEY_COUNT = 5;

export const TRANSLATION_CONFIG: TranslationConfig = {
  common: [],
  feature: "Feature.AccountSettings",
};

export const EVENT_CONSTANTS = {
  ctx: {
    passkey: "settingsPasskey",
    passkeyCreated: "settingsPasskeyCreated",
  },
  eventTypes: {
    authButtonClick: "authButtonClick",
    authModalShown: "authModalShown",
    authClientError: "authClientError",
  },
  btn: {
    cancel: "cancel",
    continue: "continue",
  },
  state: {
    addPasskey: "addPasskey",
    userOSDialogError: "userOSDialogError",
  },
  passkeyErrorSources: {
    startStep: "startRegistration",
    finishStep: "finishRegistration",
    deletePasskey: "deletePasskey",
    registerCredentialsEmptyResponse: "registerCredentialsEmptyResponse",
    registerCredentialsErrorCode: "registerCredentialsErrorCode",
  },
};

export const PASSKEYS_HELP_URL = "https://en.help.roblox.com/hc/en-us/articles/20669991483156";
