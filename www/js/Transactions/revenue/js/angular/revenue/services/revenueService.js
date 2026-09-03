import revenueModule from '../revenueModule';

function revenueService(httpService, $q, $filter, revenueConstants, languageResource) {
  'ngInject';

  const getCurrency = (targetId, targetType) => {
    let urlConfig;
    if (targetType === revenueConstants.revenueTargetTypes.Group) {
      urlConfig = {
        url: $filter('formatString')(revenueConstants.urls.getGroupCurrencyUrl, {
          groupId: targetId
        })
      };
    } else {
      urlConfig = {
        url: $filter('formatString')(revenueConstants.urls.getUserCurrencyUrl, { userId: targetId })
      };
    }

    return $q(function (resolve, reject) {
      return httpService.httpGet(urlConfig).then(
        function (responseBody) {
          resolve(responseBody.robux);
        },
        function (responseBody) {
          const errorCodes = httpService.getApiErrorCodes(responseBody);
          reject(errorCodes[0] || 0);
        }
      );
    });
  };

  const getRevenueSummary = (targetId, targetType, timeFrame) => {
    let urlConfig;
    if (targetType === revenueConstants.revenueTargetTypes.Group) {
      urlConfig = {
        url: $filter('formatString')(
          revenueConstants.urls.getTransactionRecordsApiGroupRevenueSummaryUrl,
          {
            groupId: targetId,
            timeFrame
          }
        )
      };
    } else {
      urlConfig = {
        url: $filter('formatString')(
          revenueConstants.urls.getTransactionRecordsApiUserRevenueSummaryUrl,
          {
            userId: targetId,
            timeFrame
          }
        )
      };
    }

    return $q(function (resolve, reject) {
      return httpService.httpGet(urlConfig).then(
        function (responseBody) {
          resolve(responseBody);
        },
        function (responseBody) {
          const errorCodes = httpService.getApiErrorCodes(responseBody);
          reject(errorCodes[0] || 0);
        }
      );
    });
  };

  const setTranslations = () => {
    const translations = {
      timeFrames: {
        Day: languageResource.get('Label.Day'),
        Week: languageResource.get('Label.Week'),
        Month: languageResource.get('Label.Month'),
        Year: languageResource.get('Label.Year')
      },
      payoutTypes: {
        Percentage: languageResource.get('Label.Percentage'),
        Amount: languageResource.get('Heading.Amount')
      }
    };
    return translations;
  };

  const getEconomyMetadata = () => {
    const urlConfig = {
      url: revenueConstants.urls.getEconomyMetadataUrl
    };

    return $q(function (resolve, reject) {
      return httpService.httpGet(urlConfig).then(
        function (responseBody) {
          resolve(responseBody);
        },
        function (responseBody) {
          const errorCodes = httpService.getApiErrorCodes(responseBody);
          reject(errorCodes[0] || 0);
        }
      );
    });
  };

  return {
    getCurrency,
    getRevenueSummary,
    setTranslations,
    getEconomyMetadata
  };
}

revenueModule.factory('revenueService', revenueService);
export default revenueService;
