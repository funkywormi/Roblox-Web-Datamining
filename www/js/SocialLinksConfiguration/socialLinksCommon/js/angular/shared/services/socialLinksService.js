import { authenticatedUser } from 'header-scripts';
import socialLinksCommonModule from '../socialLinksCommonModule.js';

const defaultSocialLinksMetadata = { AmazonStoreLinksEnabledForUser: false };

function socialLinksService($q, httpService, socialLinksConstants, $window) {
  'ngInject';

  const socialLinkCache = {};

  const mapSocialLinksErrorCode = function (responseData, errorCodeMap) {
    const errorCodes = httpService.getApiErrorCodes(responseData);
    const errorCode = errorCodes[0] || socialLinksConstants.errorCodes.internal.unknownError;

    if (
      errorCode === socialLinksConstants.errorCodes.internal.unknownError ||
      !errorCodeMap.hasOwnProperty(errorCode)
    ) {
      return errorCode;
    }

    return errorCodeMap[errorCode];
  };

  const getSocialLinksMetadata = function (targetId) {
    return $q(function (resolve, reject) {
      if (targetId <= 0) {
        reject(socialLinksConstants.errorCodes.internal.invalidTarget);
        return;
      }

      if (!authenticatedUser.isAuthenticated || authenticatedUser.isUnder13) {
        reject(socialLinksConstants.errorCodes.internal.invalidViewer);
        return;
      }

      const urlConfig = {
        url: `${socialLinksConstants.urlBase.getGameSocialLinksMetadata}/v1/universes/${targetId}/social-links/metadata`
      };

      const errorCodeMap = socialLinksConstants.errorCodes.getGameSocialLinks;

      httpService.httpGet(urlConfig).then(
        function (responseData) {
          resolve(responseData);
        },
        function (responseData) {
          reject(mapSocialLinksErrorCode(responseData, errorCodeMap));
        }
      );
    });
  };

  const getSocialLinks = function (targetType, targetId, fetchMetaData = false) {
    return $q(function (resolve, reject) {
      if (targetId <= 0) {
        reject(socialLinksConstants.errorCodes.internal.invalidTarget);
        return;
      }
      if (!authenticatedUser.isAuthenticated || authenticatedUser.isUnder13) {
        reject(socialLinksConstants.errorCodes.internal.invalidViewer);
        return;
      }

      const cacheKey = `${targetType || ''}:${targetId}`;
      if (socialLinkCache[cacheKey]) {
        resolve(socialLinkCache[cacheKey]);
        return;
      }

      const urlConfig = {};
      let errorCodeMap;

      switch (targetType) {
        case socialLinksConstants.targetTypes.game:
          urlConfig.url = `${socialLinksConstants.urlBase.getGameSocialLinks}/v1/games/${targetId}/social-links/list`;
          errorCodeMap = socialLinksConstants.errorCodes.getGameSocialLinks;
          break;
        case socialLinksConstants.targetTypes.group:
          urlConfig.url = `${socialLinksConstants.urlBase.getGroupSocialLinks}/v1/groups/${targetId}/social-links`;
          errorCodeMap = socialLinksConstants.errorCodes.getGroupSocialLinks;
          break;
        case socialLinksConstants.targetTypes.user:
          urlConfig.url = `${socialLinksConstants.urlBase.getUserSocialLinks}/v1/users/${targetId}/promotion-channels?alwaysReturnUrls=true`;
          errorCodeMap = socialLinksConstants.errorCodes.getUserSocialLinks;
          break;
        default:
          reject(socialLinksConstants.errorCodes.invalidTarget);
          return;
      }

      httpService.httpGet(urlConfig).then(
        function (responseData) {
          const result = {};
          if (targetType === socialLinksConstants.targetTypes.user) {
            result.data = [];
            Object.keys(socialLinksConstants.socialMediaTypes).forEach(socialMediaType => {
              const socialMediaUrl = responseData[socialMediaType];
              if (socialMediaUrl) {
                result.data.push({
                  id: 0,
                  title: socialLinksConstants.socialMediaTypes[socialMediaType],
                  type: socialLinksConstants.socialMediaTypes[socialMediaType],
                  url: socialMediaUrl
                });
              }
            });
          } else {
            result.data = responseData.data;
          }

          result.socialLinksVerificationStatus = responseData.socialLinksVerificationStatus;

          result.data.forEach(function (socialLink) {
            socialLink.target = {
              id: targetId,
              type: targetType
            };
          });

          if (fetchMetaData) {
            getSocialLinksMetadata(targetId).then(
              (socialLinksMetadata = defaultSocialLinksMetadata) => {
                const responseWithMetaData = { ...result, socialLinksMetadata };
                socialLinkCache[cacheKey] = responseWithMetaData;
                resolve(responseWithMetaData);
              }
            );
          } else {
            const responseWithMetaData = {
              ...result,
              socialLinksMetadata: defaultSocialLinksMetadata
            };
            socialLinkCache[cacheKey] = responseWithMetaData;
            resolve(responseWithMetaData);
          }
        },
        function (responseData) {
          reject(mapSocialLinksErrorCode(responseData, errorCodeMap));
        }
      );
    });
  };

  const saveSocialLink = function (socialLink) {
    return $q(function (resolve, reject) {
      let errorCodeMap;
      const urlConfig = {};
      const requestBody = {
        type: socialLink.type,
        url: socialLink.url,
        title: socialLink.title
      };

      switch (socialLink.target.type) {
        case socialLinksConstants.targetTypes.game:
          urlConfig.url = `${socialLinksConstants.urlBase.setGameSocialLinks}/v1/universes/${socialLink.target.id}/social-links`;
          errorCodeMap = socialLinksConstants.errorCodes.setGameSocialLinks;
          break;
        case socialLinksConstants.targetTypes.group:
          urlConfig.url = `${socialLinksConstants.urlBase.setGroupSocialLinks}/v1/groups/${socialLink.target.id}/social-links`;
          errorCodeMap = socialLinksConstants.errorCodes.setGroupSocialLinks;
          break;
        default:
          reject(socialLinksConstants.errorCodes.invalidTarget);
          return;
      }

      if (socialLink.id) {
        urlConfig.url += `/${socialLink.id}`;

        httpService.httpPatch(urlConfig, requestBody).then(resolve, function (responseData) {
          reject(mapSocialLinksErrorCode(responseData, errorCodeMap));
        });
      } else {
        httpService.httpPost(urlConfig, requestBody).then(
          function (responseData) {
            socialLink.id = responseData.id || responseData.Id; // Develop Api doesn't camelCase response body...
            resolve();
          },
          function (responseData) {
            reject(mapSocialLinksErrorCode(responseData, errorCodeMap));
          }
        );
      }
    });
  };

  const deleteSocialLink = function (socialLink) {
    return $q(function (resolve, reject) {
      const urlConfig = {};
      let errorCodeMap;

      switch (socialLink.target.type) {
        case socialLinksConstants.targetTypes.game:
          urlConfig.url = `${socialLinksConstants.urlBase.setGameSocialLinks}/v1/universes/${socialLink.target.id}/social-links`;
          errorCodeMap = socialLinksConstants.errorCodes.setGameSocialLinks;
          break;
        case socialLinksConstants.targetTypes.group:
          urlConfig.url = `${socialLinksConstants.urlBase.setGroupSocialLinks}/v1/groups/${socialLink.target.id}/social-links`;
          errorCodeMap = socialLinksConstants.errorCodes.setGroupSocialLinks;
          break;
        default:
          reject(socialLinksConstants.errorCodes.invalidTarget);
          return;
      }

      urlConfig.url += `/${socialLink.id}`;

      httpService.httpDelete(urlConfig).then(resolve, function (responseData) {
        reject(mapSocialLinksErrorCode(responseData, errorCodeMap));
      });
    });
  };

  return {
    getSocialLinks,
    getSocialLinksMetadata,
    saveSocialLink,
    deleteSocialLink
  };
}

socialLinksCommonModule.factory('socialLinksService', socialLinksService);
export default socialLinksService;
