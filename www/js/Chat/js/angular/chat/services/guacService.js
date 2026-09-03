import { EnvironmentUrls, Guac } from 'Roblox';
import chatModule from '../chatModule';

function guacService($q, httpService, $log) {
  'ngInject';

  return {
    getChatUiPolicies() {
      return Guac.callBehaviour('chat-ui');
    },
    getAppPolicies() {
      return Guac.callBehaviour('app-policy');
    },
    getAbuseReportRevampPolicies() {
      return Guac.callBehaviour('abuse-reporting-revamp');
    },
    getPlusIdentityBadgePolicies() {
      return Guac.callBehaviour('web-plus-identity-badge');
    }
  };
}

chatModule.factory('guacService', guacService);

export default guacService;
