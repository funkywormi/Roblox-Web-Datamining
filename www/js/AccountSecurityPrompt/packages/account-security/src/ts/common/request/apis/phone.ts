import { httpService } from "core-utilities";
import { Result } from "../../result";
import { toResult } from "../common";
import * as Phone from "../types/phone";

export const getPhoneConfiguration = async (): Promise<
  Result<Phone.GetPhoneConfigurationReturnType, Phone.PhoneError | null>
> => toResult(httpService.get(Phone.GET_PHONE_CONFIG, {}), Phone.PhoneError);

export const prioritizeDefaultPrefix = (
  getPhonePrefixListResult: Phone.GetPhonePrefixesListReturnType,
): Phone.GetPhonePrefixesListReturnType => {
  // prefix list may contain indicator of default prefix
  const defaultPrefixByLocation = getPhonePrefixListResult.find(element => {
    return element.isDefault;
  });

  let processedResult = getPhonePrefixListResult;
  if (defaultPrefixByLocation !== undefined) {
    // Find default option and put that at the top of the list
    processedResult = getPhonePrefixListResult.filter(p => {
      return p.code !== defaultPrefixByLocation.code;
    });

    processedResult.unshift(defaultPrefixByLocation);
  }
  return processedResult;
};

export const getPhonePrefixList = async (): Promise<
  Result<Phone.GetPhonePrefixesListReturnType, Phone.PhoneError | null>
> => {
  return toResult(
    httpService.get(Phone.GET_PHONE_PREFIXES_LIST_CONFIG, {}),
    Phone.PhoneError,
    prioritizeDefaultPrefix,
  );
};

export const updatePhone = async (
  value: Phone.UpdatePhoneParameters,
): Promise<Result<Phone.UpdatePhoneReturnType, Phone.UpdatePhoneError | null>> => {
  return toResult(httpService.post(Phone.POST_PHONE_CONFIG, value), Phone.UpdatePhoneError);
};

export const verifyCode = async (
  value: Phone.VerifyCodeParameters,
): Promise<Result<Phone.VerifyCodeReturnType, Phone.VerifyCodeError | null>> => {
  return toResult(httpService.post(Phone.VERIFY_CODE_CONFIG, value), Phone.VerifyCodeError);
};

export const resendCode = async (
  value: Phone.ResendCodeParameters,
): Promise<Result<Phone.ResendCodeReturnType, Phone.ResendCodeError | null>> => {
  return toResult(httpService.post(Phone.RESEND_CODE_CONFIG, value), Phone.ResendCodeError);
};
