import { CurrentUser, EnvironmentUrls, Guac } from 'Roblox';
import groupModule from '../groupModule';

function groupDetailsService(httpService, $filter, groupDetailsConstants, groupsConstants) {
  'ngInject';

  function profilePageUrl(userId) {
    return `${EnvironmentUrls.websiteUrl}/users/${userId}/profile`;
  }

  async function getAbuseReportRevampPolicyInfo() {
    return Guac.callBehaviour('abuse-reporting-revamp');
  }

  function abusePageRevampUrl(type, targetId, custom) {
    const url = $filter('formatString')(
      decodeURIComponent(groupDetailsConstants.absoluteUrls.abuseReportRevamp),
      {
        targetId,
        submitterId: CurrentUser.userId,
        abuseVector: type,
        custom: custom ? encodeURIComponent(JSON.stringify(custom)) : ''
      }
    );
    return url;
  }

  function abusePageUrl(type, id) {
    return $filter('formatString')(
      decodeURIComponent(groupDetailsConstants.absoluteUrls.reportAbuse),
      {
        type,
        id,
        absUrl: encodeURIComponent(window.location.href)
      }
    );
  }

  function configureGroupUrl(groupId) {
    return `${EnvironmentUrls.websiteUrl}/${groupsConstants.urlBase}/configure?id=${groupId}`;
  }

  function changeOwnerCreatorHubUrl(groupId) {
    return `https://create.${EnvironmentUrls.domain}/dashboard/group/profile?activeTab=GroupProfileTab&groupId=${groupId}`;
  }

  return {
    profilePageUrl,
    abusePageUrl,
    configureGroupUrl,
    changeOwnerCreatorHubUrl,
    abusePageRevampUrl,
    getAbuseReportRevampPolicyInfo
  };
}

groupModule.factory('groupDetailsService', groupDetailsService);

export default groupDetailsService;
