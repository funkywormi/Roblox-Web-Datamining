import groupPayoutsModule from '../groupPayoutsModule';

function groupPayoutsService(
  httpService,
  $q,
  $filter,
  $log,
  groupPayoutsConstants,
  languageResource,
  groupsService
) {
  'ngInject';

  const getGroupPayoutRecipients = function (groupId) {
    const urlConfig = {
      url: $filter('formatString')(groupPayoutsConstants.urls.getPayoutsUrl, { groupId })
    };

    return $q(function (resolve, reject) {
      return httpService.httpGet(urlConfig).then(
        function (responseBody) {
          const recipients = responseBody.data.map(function (recipient) {
            return {
              user: {
                id: recipient.user.userId,
                name: recipient.user.username,
                displayName: recipient.user.displayName
              },
              percentage: recipient.percentage
            };
          });

          const promises = [];
          recipients.forEach(function (recipient) {
            promises.push(groupsService.getUserRoleInGroup(recipient.user.id, groupId));
          });

          $q.all(promises).then(
            function (responses) {
              for (let i = 0; i < responses.length; i++) {
                let role = responses[i];
                if (role == null) {
                  // Assign to guest roleset object
                  role = groupPayoutsConstants.guestRoleset;
                }
                recipients[i].role = role;
              }
              resolve(recipients);
            },
            function (error) {
              $log.debug('--error waiting for userRoleInGroup promises---');
              reject(error);
            }
          );
        },
        function (responseBody) {
          const errorCodes = httpService.getApiErrorCodes(responseBody);
          reject(errorCodes[0] || 0);
        }
      );
    });
  };

  const postGroupPayout = function (groupId, payoutType, recipients) {
    const urlConfig = {
      url: $filter('formatString')(groupPayoutsConstants.urls.postGroupPayoutUrl, {
        groupId
      })
    };
    const data = {
      PayoutType: payoutType,
      Recipients: recipients
    };
    return httpService.httpPost(urlConfig, data);
  };

  const postGroupRecurringPayout = function (groupId, payoutType, recipients) {
    const urlConfig = {
      url: $filter('formatString')(groupPayoutsConstants.urls.postGroupRecurringPayoutUrl, {
        groupId
      })
    };
    const data = {
      PayoutType: payoutType,
      Recipients: recipients
    };
    return httpService.httpPost(urlConfig, data);
  };

  const getGroupPayoutRestriction = function (groupId) {
    const urlConfig = {
      url: $filter('formatString')(groupPayoutsConstants.urls.groupPayoutRestrictionUrl, {
        groupId
      })
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

  const setTranslations = function () {
    const translations = {
      payoutTypes: {
        Percentage: languageResource.get('Label.Percentage'),
        Amount: languageResource.get('Heading.Amount')
      }
    };
    return translations;
  };

  const getAddFundsLatest = function (groupId) {
    const urlConfig = {
      url: $filter('formatString')(groupPayoutsConstants.urls.getAddFundsLatestUrl, { groupId })
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

  const postAddFunds = function (groupId, robuxAmount) {
    const urlConfig = {
      url: $filter('formatString')(groupPayoutsConstants.urls.postAddFundsUrl, {
        groupId
      })
    };

    const data = { robuxAmount };
    return httpService.httpPost(urlConfig, data);
  };

  const getUserPayoutEligibility = function (groupId, userIds) {
    const config = {
      url: $filter('formatString')(groupPayoutsConstants.urls.getUsersGroupPayoutEligibility, {
        groupId
      })
    };

    const params = {
      userIds
    };

    return httpService.httpGet(config, params);
  };

  return {
    getGroupPayoutRecipients,
    postGroupPayout,
    setTranslations,
    postGroupRecurringPayout,
    getGroupPayoutRestriction,
    getAddFundsLatest,
    postAddFunds,
    getUserPayoutEligibility
  };
}

groupPayoutsModule.factory('groupPayoutsService', groupPayoutsService);
export default groupPayoutsService;
