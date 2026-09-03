import phoneValidationModule from '../phoneValidationModule';
import { EnvironmentUrls } from 'Roblox';

function phoneService($q, httpService, phoneConstants) {
  'ngInject';

  const getPhonePrefixesUrl = phoneConstants.urls.phonePrefixes;
  const getAllPhonePrefixesUrl = phoneConstants.urls.allPhonePrefixes;
  const { defaultCountryCode } = phoneConstants;

  function getPhonePrefixesInternal(phonePrefixesUrl) {
    const apiGatewayUrl = EnvironmentUrls.apiGatewayUrl;
    const url = apiGatewayUrl + phonePrefixesUrl;
    const urlConfig = {
      url
    };
    return httpService.httpGet(urlConfig, null).then(function (data) {
      let defaultPrefix;
      // Find default option and put that at the top of the list
      _.reject(data, function (p) {
        if (p.code === defaultCountryCode) {
          defaultPrefix = p;
          return true;
        }

        return false;
      });

      if (defaultPrefix) {
        data.unshift(defaultPrefix);
      }

      return data;
    });
  }

  function getPhonePrefixes(apiProxyDomain) {
    return getPhonePrefixesInternal(getPhonePrefixesUrl);
  }

  function getAllPhonePrefixes(apiProxyDomain) {
    return getPhonePrefixesInternal(getAllPhonePrefixesUrl);
  }

  function addPhone(phoneInfo) {
    const url = Roblox.EnvironmentUrls.accountInformationApi + phoneConstants.urls.addPhoneV2;

    const urlConfig = {
      url
    };

    const params = {
      countryCode: phoneInfo.countryCode,
      prefix: phoneInfo.prefix,
      phone: phoneInfo.phone,
      password: phoneInfo.password
    };

    return httpService.httpPost(urlConfig, params);
  }

  function verifyPhone(codeInfo) {
    const url = Roblox.EnvironmentUrls.accountInformationApi + phoneConstants.urls.verifyPhoneV2;

    const urlConfig = {
      url
    };

    const params = {
      code: codeInfo.code
    };

    return httpService.httpPost(urlConfig, params);
  }

  function resendCode() {
    const url = Roblox.EnvironmentUrls.accountInformationApi + phoneConstants.urls.resendCodeV2;

    const urlConfig = {
      url
    };

    return httpService.httpPost(urlConfig);
  }

  function isPhoneNumber(input) {
    if (!input || input.length < phoneConstants.minimumPhoneLength) {
      return false;
    }

    // input must contain at least one digit
    if (!/\d/.test(input)) {
      return false;
    }

    // input may only contain digits and special characters (including underscore)
    return /^[\d|\W|_]+$/.test(input);
  }

  return {
    getPhonePrefixes,
    getAllPhonePrefixes,
    addPhone,
    verifyPhone,
    resendCode,
    isPhoneNumber
  };
}

phoneValidationModule.factory('phoneService', phoneService);

export default phoneService;
