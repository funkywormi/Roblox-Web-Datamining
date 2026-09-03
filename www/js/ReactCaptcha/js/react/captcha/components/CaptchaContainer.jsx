import React, { useState } from 'react';
import Captcha from './Captcha';

function CaptchaContainer() {
  const [captchaProperties, setCaptchaProperties] = useState({
    captchaActionType: null,
    captchaActivated: null,
    captchaError: null,
    captchaSuccess: null,
    captchaReturnTokenInSuccessCb: null,
    inputParams: {},
    captchaDismissed: null,
    endCaptcha: null
  });
  window.addEventListener(
    'UpdateCaptchaWidget',
    event => {
      setCaptchaProperties({ ...captchaProperties, ...event.detail });
    },
    false
  );

  return (
    <Captcha
      captchaActionType={captchaProperties.captchaActionType}
      captchaActivated={captchaProperties.captchaActivated}
      captchaError={captchaProperties.captchaError}
      captchaSuccess={captchaProperties.captchaSuccess}
      captchaReturnTokenInSuccessCb={captchaProperties.captchaReturnTokenInSuccessCb}
      inputParams={captchaProperties.inputParams}
      captchaDismissed={captchaProperties.captchaDismissed}
      endCaptcha={captchaProperties.endCaptcha}
    />
  );
}

export default CaptchaContainer;
