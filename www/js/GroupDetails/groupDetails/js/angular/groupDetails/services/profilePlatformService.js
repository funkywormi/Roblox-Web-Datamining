import { fetchProfilePlatform, Component, ProfileType } from '@rbx/profile-platform';
import groupModule from '../groupModule';

function profilePlatformService() {
  'ngInject';

  function initializeProfilePlatform(groupId, isGracefulDegradationEnabled = false) {
    const fullComponents = [
      { component: Component.CommunityProfileHeader },
      { component: Component.CoverPhoto },
      { component: Component.Actions },
      { component: Component.Videos },
      { component: Component.CommunityTabs },
      { component: Component.About },
      { component: Component.Announcements },
      { component: Component.Events },
      { component: Component.Experiences },
      { component: Component.ExperienceServers },
      { component: Component.ForumsDiscovery },
      { component: Component.Members },
      { component: Component.CommunityLocked }
    ];

    const gracefulDegradationComponents = [
      { component: Component.CommunityProfileHeader },
      { component: Component.CoverPhoto },
      { component: Component.Actions },
      { component: Component.CommunityTabs },
      { component: Component.About },
      { component: Component.Announcements },
      { component: Component.Experiences },
      { component: Component.CommunityLocked }
    ];

    const components = isGracefulDegradationEnabled
      ? gracefulDegradationComponents
      : fullComponents;

    const result = fetchProfilePlatform({
      profileId: groupId,
      profileType: ProfileType.Community,
      components,
      includeComponentOrdering: true
    });

    return result;
  }

  function refreshProfilePlatform(groupId, components) {
    const result = fetchProfilePlatform({
      profileId: groupId,
      profileType: ProfileType.Community,
      components,
      includeComponentOrdering: false
    });

    return result;
  }

  return {
    initializeProfilePlatform,
    refreshProfilePlatform
  };
}

groupModule.factory('profilePlatformService', profilePlatformService);

export default profilePlatformService;
