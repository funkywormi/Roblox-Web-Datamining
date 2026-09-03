/* eslint-disable */
import { httpService } from 'core-utilities';
import captchaV2Constants from '../constants/captchaConstants';
import { CaptchaConstants, FunCaptcha } from '../../../jquery/captcha/appCaptchaEntry';

const captchaIdCounter = { id: 0 };
let metadataCache = null;
const events = {};

export const getCaptchaId = () => {
  captchaIdCounter.id += 1;
  return `captchaV2-${captchaIdCounter.id}`;
};

const getCaptchaMetadata = () => {
  return new Promise((resolve, reject) => {
    if (metadataCache) {
      resolve(metadataCache);
    }
    const urlConfig = {
      url: captchaV2Constants.urls.getMetadata
    };

    httpService.get(urlConfig).then(response => {
      metadataCache = response;
      resolve(response);
    }, reject);
  });
};

const fireEvent = (funCaptchaType, eventName, data) => {
  if (!Object.prototype.hasOwnProperty.call(events, funCaptchaType)) {
    return;
  }

  events[funCaptchaType].forEach(event => {
    if (event.name === eventName) {
      event.handle(data);
    }
  });
};

const addEvent = (funCaptchaType, eventName, handler) => {
  if (handler) {
    events[funCaptchaType] = events[funCaptchaType] || [];
    events[funCaptchaType].push({
      name: eventName,
      handle: handler
    });
  }
};

const clearEvents = funCaptchaType => {
  events[funCaptchaType] = [];
};

const mapFunCaptchaErrorCodeToCaptchaV2ErrorCode = funcaptchaErrorCode => {
  switch (funcaptchaErrorCode) {
    case CaptchaConstants.errorCodes.failedToLoadProviderScript:
      return captchaV2Constants.errorCodes.internal.failedToLoadProviderScript;
    case CaptchaConstants.errorCodes.failedToVerify:
      return captchaV2Constants.errorCodes.internal.failedToVerify;
    default:
      return captchaV2Constants.errorCodes.internal.unknown;
  }
};

export const renderCaptcha = (
  elementId,
  captchaActionType,
  shownEvent,
  returnTokenInSuccessCb,
  inputParams,
  extraValidationParams
) => {
  // Breaking change that should not be triggered. This is sanity checking before removing the whole CAPI V1 module.
  throw new Error('CAPI V1 is deprecated');
  return new Promise((resolve, reject) => {
    const funCaptchaType = captchaV2Constants.funCaptchaCaptchaTypes[captchaActionType];
    let captchaInfo = `\n\telementId: ${elementId}\n\tcaptchaActionType: ${captchaActionType}\n\tfunCaptchaType: ${funCaptchaType}`;

    console.debug(`Render captcha${captchaInfo}`);

    if (!funCaptchaType) {
      console.warn(`Missing funCaptchaType for ${captchaActionType}`);
      reject(captchaV2Constants.errorCodes.internal.missingActionType);
    }
    addEvent(funCaptchaType, captchaV2Constants.funCaptchaEvents.resolve, resolve);
    addEvent(funCaptchaType, captchaV2Constants.funCaptchaEvents.reject, reject);
    addEvent(funCaptchaType, captchaV2Constants.funCaptchaEvents.shown, shownEvent);

    let successCb;
    if (returnTokenInSuccessCb) {
      successCb = (fcToken, captchaId) => {
        captchaInfo += `\ncaptchaId: ${captchaId}`;
        captchaInfo += `\ntoken: ${fcToken}`;
        console.debug(`Passed captcha${captchaInfo}`);
        if (captchaId === null || captchaId === '') {
          fireEvent(funCaptchaType, captchaV2Constants.funCaptchaEvents.resolve, {
            token: fcToken,
            captchaId: ''
          });
        } else {
          fireEvent(funCaptchaType, captchaV2Constants.funCaptchaEvents.resolve, {
            token: fcToken,
            captchaId
          });
        }
        clearEvents(funCaptchaType);
      };
    } else {
      successCb = () => {
        console.debug(`Passed captcha${captchaInfo}`);
        fireEvent(funCaptchaType, captchaV2Constants.funCaptchaEvents.resolve);
        clearEvents(funCaptchaType);
      };
    }

    FunCaptcha.render(elementId, {
      cType: funCaptchaType,

      returnTokenInSuccessCb,

      inputParams,

      // These methods are thrown away on subsequent calls.
      successCb,

      shownCb: () => {
        console.debug(`Captcha shown${captchaInfo}`);
        fireEvent(funCaptchaType, captchaV2Constants.funCaptchaEvents.shown);
      },

      errorCb: (errorCode, exception) => {
        if (exception) {
          console.error(`Failed captcha (${errorCode}:) ${exception}${captchaInfo}`);
        } else {
          console.debug(`Failed captcha (${errorCode})${captchaInfo}`);
        }

        const externalErrorCode = mapFunCaptchaErrorCodeToCaptchaV2ErrorCode(errorCode);

        fireEvent(funCaptchaType, captchaV2Constants.funCaptchaEvents.reject, externalErrorCode);
        clearEvents(funCaptchaType);
      },

      extraValidationParams: extraValidationParams || {}
    });
  });
};

getCaptchaMetadata().then(
  metadata => {
    const publicKeys = metadata.data.funCaptchaPublicKeys;
    const captchaTypes = [];

    Object.keys(captchaV2Constants.funCaptchaPublicKeyMap).forEach(funCaptchaType => {
      const publicKeyType = captchaV2Constants.funCaptchaPublicKeyMap[funCaptchaType];
      if (publicKeyType && Object.prototype.hasOwnProperty.call(publicKeys, publicKeyType)) {
        captchaTypes.push({
          Type: funCaptchaType,
          ApiUrl: captchaV2Constants.urls.funCaptchaRedeem[publicKeyType], // this does not need to be defined for BEDEV2
          PublicKey: publicKeys[publicKeyType]
        });
      } else {
        console.warn(
          `Missing public key for: ${funCaptchaType}\n\tpublicKeyType: ${publicKeyType}`
        );
      }
    });

    console.debug('Add captcha types from new webapp:', captchaTypes);

    FunCaptcha.addCaptchaTypes(captchaTypes, false);
  },
  function () {
    console.debug(
      'Failed to load captcha metadata for funCaptchaService. FunCaptcha will not work properly.'
    );
  }
);

export const openCaptcha = captchaOptions => {
  const event = new CustomEvent('UpdateCaptchaWidget', {
    detail: captchaOptions
  });

  if (
    Object.prototype.hasOwnProperty.call(captchaOptions, 'captchaActionType') &&
    Object.prototype.hasOwnProperty.call(captchaOptions, 'captchaActivated') &&
    Object.prototype.hasOwnProperty.call(captchaOptions, 'captchaError') &&
    Object.prototype.hasOwnProperty.call(captchaOptions, 'captchaSuccess') &&
    Object.prototype.hasOwnProperty.call(captchaOptions, 'captchaReturnTokenInSuccessCb') &&
    Object.prototype.hasOwnProperty.call(captchaOptions, 'inputParams')
  ) {
    window.dispatchEvent(event);
    return true;
  }

  console.debug('Failed to render captcha. Missing properties.');
  return false;
};
