import friendsConstants from '../constants/friendsConstants';

export function isCaptchaResponse(error) {
  if (error?.status === friendsConstants.FORBIDDEN_STATUS) {
    if (
      error?.data?.errors?.length &&
      error.data.errors[0]?.code === friendsConstants.CAPTCHA_CODE
    ) {
      return true;
    }
  }
  return false;
}

export function getDataExchangeFromError(error) {
  return error?.data?.errors[0]?.fieldData;
}
