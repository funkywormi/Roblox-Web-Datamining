import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { getCaptchaId, renderCaptcha } from '../services/captchaService';
import captchaV2Constants from '../constants/captchaConstants';

let lastActivated = false;
let active = false;

/**
 * captchaActivated: true if captcha is requested to be activated
 *
 * captchaActionType: captcha action types corresponding to captchaActionTypes
 * in constants
 *
 * captchaError: callback function called if captcha fails
 *
 * captchaSuccess: callback function called if captcha succeeds
 *
 * captchaReturnTokenInSuccessCb: true if there is a captcha token return once
 * captcha succeeds
 *
 * inputParams: parameters are required for captcha, e.g. data exchange blob.
 *
 * captchaDismissed (optional): callback function called if captcha is closed
 *
 * extraValidationParams: extra validation parameters
 *
 * endCaptcha  (optional): call back fucntion called if captcha ends. Usually it should
 * update the variable passed in as captchaActivated to be false
 */

function Captcha({
  captchaActivated,
  captchaActionType,
  captchaError,
  captchaSuccess,
  captchaReturnTokenInSuccessCb,
  inputParams,
  captchaDismissed,
  extraValidationParams,
  endCaptcha
}) {
  const [state, setState] = useState({
    id: null,
    shown: null
  });

  const captchaEnded = () => {
    setState({
      ...state,
      shown: false
    });
    active = false;
    endCaptcha();
  };

  const captchaShown = () => {
    setState({
      ...state,
      shown: true
    });
  };

  const hideCaptcha = () => {
    endCaptcha();
    if (captchaDismissed) {
      captchaDismissed();
    }
  };

  const beginCaptcha = () => {
    if (!captchaActivated || active) {
      return;
    }
    active = true;

    const returnTokenInSuccessCb = captchaReturnTokenInSuccessCb === true;
    let successCb;

    if (returnTokenInSuccessCb) {
      successCb = callbackData => {
        if (captchaActivated) {
          const captchaData = {
            captchaId: callbackData.captchaId,
            captchaToken: callbackData.token,
            captchaProvider: captchaV2Constants.captchaProviders.arkoseLabs
          };
          captchaSuccess(captchaData);
        }
        captchaEnded();
      };
    } else {
      successCb = () => {
        if (captchaActivated) {
          captchaSuccess();
        }
        captchaEnded();
      };
    }

    renderCaptcha(
      state.id,
      captchaActionType,
      captchaShown,
      returnTokenInSuccessCb,
      inputParams,
      extraValidationParams
    ).then(successCb, errorCode => {
      if (captchaActivated) {
        captchaError(errorCode);
      }
      captchaEnded();
    });
  };

  useEffect(() => {
    if (state.id === null) {
      setState({
        ...state,
        id: getCaptchaId()
      });
    }
    if (lastActivated !== captchaActivated) {
      lastActivated = captchaActivated;
      beginCaptcha();
    }
  }, [captchaActivated]);

  const getCaptchaClass = () => {
    const captchaClass = 'captcha-container modal';
    if (state.shown && captchaActivated) {
      return [captchaClass, 'captcha-activated'].join(' ');
    }
    return captchaClass;
  };

  return (
    <div role='button' tabIndex='0' className={getCaptchaClass()} onClick={hideCaptcha}>
      <div className='modal-dialog'>
        <div className='modal-content'>
          <div
            role='link'
            tabIndex={-1}
            className='modal-body'
            onClick={event => event.stopPropagation()}>
            <button type='button' className='close' onClick={hideCaptcha}>
              <span aria-hidden='true'>
                <span className='icon-close' />
              </span>
              <span className='sr-only'>{captchaV2Constants.literals.close}</span>
            </button>
            <div id={state.id} className='captchav2-funcaptcha-modal-body' />
          </div>
        </div>
      </div>
    </div>
  );
}

Captcha.propTypes = {
  captchaActionType: PropTypes.string.isRequired,
  captchaActivated: PropTypes.bool.isRequired,
  captchaError: PropTypes.func.isRequired,
  captchaSuccess: PropTypes.func.isRequired,
  captchaReturnTokenInSuccessCb: PropTypes.bool.isRequired,
  inputParams: PropTypes.shape({
    dataExchange: PropTypes.string,
    unifiedCaptchaId: PropTypes.string
  }).isRequired,
  captchaDismissed: PropTypes.func.isRequired,
  extraValidationParams: PropTypes.func.isRequired,
  endCaptcha: PropTypes.func.isRequired
};

export default Captcha;
