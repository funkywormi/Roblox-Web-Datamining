import profileAboutModule from '../profileAboutModule';

function profileDescriptionService(httpService, profileDescriptionConstants, descriptionLayout) {
  'ngInject';

  function sendData(url, params, method, excludeCacheHeaders) {
    const urlConfig = {
      url,
      withCredentials: true
    };
    let data;
    switch (method) {
      case httpService.methods.get:
        urlConfig.noCache = !excludeCacheHeaders;
        return httpService.httpGet(urlConfig, params);
      case httpService.methods.post:
        urlConfig.headers = {
          'Content-Type': 'application/x-www-form-urlencoded'
        };
        if (params != null) {
          data = $.param(params);
        }
        return httpService.httpPost(urlConfig, data);
      case httpService.methods.patch:
        urlConfig.headers = {
          'Content-Type': 'application/x-www-form-urlencoded'
        };
        if (params != null) {
          data = $.param(params);
        }
        return httpService.httpPatch(urlConfig, data);
      case httpService.methods.delete:
        return httpService.httpDelete(urlConfig, params);
      default:
        return httpService.httpGet(urlConfig, params);
    }
  }

  return {
    getDescription() {
      const url = profileDescriptionConstants.urls.descriptionUrl;
      return sendData(url, null, 'GET', true);
    },

    updateDescription(description) {
      const url = profileDescriptionConstants.urls.descriptionUrl;
      const params = {
        description
      };
      return sendData(url, params, 'POST');
    },

    getDescriptionError(err) {
      const { errorCodeMapMsg } = descriptionLayout.getDescriptionResponse;
      if (err?.errors?.length) {
        const error = err.errors[0];
        const { code } = error;
        const errorMessage = errorCodeMapMsg[code];
        return errorMessage;
      } else {
        return errorCodeMapMsg[1];
      }
    },

    getAccountInformationMetadata() {
      const urlConfig = {
        url: profileDescriptionConstants.urls.metadataUrl
      };
      return httpService.httpGet(urlConfig);
    }
  };
}

profileAboutModule.factory('profileDescriptionService', profileDescriptionService);

export default profileDescriptionService;
