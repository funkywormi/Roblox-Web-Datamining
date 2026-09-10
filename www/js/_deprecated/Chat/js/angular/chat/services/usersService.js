import { Endpoints } from 'Roblox';
import angular from 'angular';
import chatModule from '../chatModule';

function usersService($q, apiParamsInitialization, httpService) {
  'ngInject';

  return {
    getUserPresence(userIds, friendsDict) {
      const presenceMultiGetLimit = 100;
      const presenceUrlConfig = apiParamsInitialization.apiSets.multiGetPresence;

      return httpService
        .buildBatchPromises(presenceUrlConfig, userIds, presenceMultiGetLimit, 'userIds', 'POST')
        .then(function (data) {
          if (data && data.length > 0) {
            let presences = [];
            angular.forEach(data, function (item) {
              const presenceData = item.userPresences;
              presences = presences.concat(presenceData);
            });
            presences.forEach(function (presence) {
              const { userId } = presence;
              if (!friendsDict[userId]) {
                friendsDict[userId] = {};
              }
              friendsDict[userId].presence = presence;
              if (Endpoints) {
                friendsDict[userId].profileUrl = Endpoints.generateAbsoluteUrl(
                  '/users/{id}/profile',
                  { id: userId },
                  true
                );
              }
            });

            return presences;
          }
          return null;
        });
    },

    getUserInfo(userIds, friendsDict) {
      const promise = {
        presences: this.getUserPresence(userIds, friendsDict)
      };

      return $q.all(promise).then(function (payload) {
        return payload;
      });
    }
  };
}

chatModule.factory('usersService', usersService);

export default usersService;
