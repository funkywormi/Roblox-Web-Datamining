import { PhonePrefix } from "../../common/types/apiTypes";
import {
  setPhoneNumberConfig,
  verifyPhoneNumberConfig,
  resendCodeToPhoneNumberConfig,
  getPhonePrefixesConfig,
  getAllPhonePrefixesConfig,
  deletePhoneNumberConfig,
} from "../../common/constants/urlConstants";
import { phoneSubmissionConstants } from "../constants/phoneConstants";
import transport from "../../../shared/request/requestTransport";
import type { RequestConfig } from "../../../shared/request/requestConfig";

const { fallbackDefaultCountryCode } = phoneSubmissionConstants;

const getPhonePrefixesInternal = (urlConfig: RequestConfig): Promise<PhonePrefix[]> => {
  return transport.get<PhonePrefix[]>(urlConfig).then(
    data => {
      let defaultPrefix;

      // prefix list may contain indicator of default prefix
      const defaultPrefixByLocation = data.find(element => {
        return element.isDefault === true;
      });

      // If no default prefix is passed in with list of prefixes, fall back to
      // constant value default country code.
      const defaultCountryCodeByLocation =
        defaultPrefixByLocation?.code ?? fallbackDefaultCountryCode;
      // Find default option and put that at the top of the list
      data.filter(p => {
        if (p.code !== defaultCountryCodeByLocation) {
          return true;
        }
        defaultPrefix = p;
        return false;
      });

      if (defaultPrefix) {
        data.unshift(defaultPrefix);
      }
      return data;
    },
    () => {
      // Was `false`, which callers assigned into phonePrefixOptionsList and then mapped over,
      // so a failed fetch threw. An empty list is what the length check downstream expects.
      return [];
    },
  );
};

export const getPhonePrefixes = () => {
  const urlConfig = getPhonePrefixesConfig();
  return getPhonePrefixesInternal(urlConfig);
};

export const getAllPhonePrefixes = () => {
  const urlConfig = getAllPhonePrefixesConfig();
  return getPhonePrefixesInternal(urlConfig);
};

export const setPhoneNumber = ({
  phone,
  prefix,
  countryCode,
}: {
  phone: string;
  prefix?: string;
  countryCode?: string;
}) => {
  const urlConfig = setPhoneNumberConfig();
  const formData = {
    countryCode,
    prefix,
    phone,
  };
  return transport.post(urlConfig, formData);
};

export const verifyWithCode = (code = "") => {
  const formData = {
    code,
  };
  const urlConfig = verifyPhoneNumberConfig();
  return transport.post(urlConfig, formData);
};

export const resendCode = (formData?: Record<string, unknown>) => {
  const urlConfig = resendCodeToPhoneNumberConfig();
  let postFormData = formData;
  if (!postFormData) {
    postFormData = {};
  }
  return transport.post(urlConfig, postFormData).then(
    () => {
      return true;
    },
    e => {
      return false;
    },
  );
};

export const deletePhoneNumber = () => {
  const urlConfig = deletePhoneNumberConfig();
  return transport.post(urlConfig, {});
};
