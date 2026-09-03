import { CurrentUser, ExperimentationService } from 'Roblox';
import groupsModule from '../groupsModule';

function groupExperimentsService(groupsConstants) {
  'ngInject';

  const experimentLayers = {};
  const getExperimentLayer = async layerName => {
    if (!experimentLayers[layerName]) {
      experimentLayers[layerName] = ExperimentationService.getAllValuesForLayer(layerName);
    }

    return experimentLayers[layerName];
  };

  return {
    getLandingPageExperiment: async () => {
      const response = {
        useSearchLanding: false,
        isSearchV2: false
      };
      if (!CurrentUser.isAuthenticated) {
        return response;
      }

      try {
        const experimentConfig = await getExperimentLayer(groupsConstants.experimentLayer);

        if (experimentConfig.groupsLandingConfig) {
          const { isSearchV2, useSearchLanding } = experimentConfig.groupsLandingConfig;
          response.isSearchV2 = isSearchV2;
          response.useSearchLanding = useSearchLanding;
        }
      } catch (e) {
        /* no-op return control */
      }
      return response;
    },

    exposeLandingPageExperiment: () => {
      if (!CurrentUser.isAuthenticated) {
        return;
      }
      ExperimentationService.logLayerExposure(groupsConstants.experimentLayer);
    },

    isHidingEmptyCommunityTabsExperimentEnabled: async () => {
      if (!CurrentUser.isAuthenticated) {
        return false;
      }

      try {
        const experimentConfig = await getExperimentLayer(
          groupsConstants.socialCommunityExperimentLayer
        );

        return experimentConfig.hideEmptyCommunityTabs ?? false;
      } catch (e) {
        // no-op, return control
      }
      return false;
    },

    isGroupsListRedesignExperimentEnabled: async () => {
      if (!CurrentUser.isAuthenticated) {
        return false;
      }

      try {
        const experimentConfig = await getExperimentLayer(
          groupsConstants.socialCommunityExperimentLayer
        );

        return experimentConfig?.showGroupsListRedesign ?? true;
      } catch (e) {
        // no-op, return control
      }
      return false;
    },

    isGroupExperiencesRedesignExperimentEnabled: async () => {
      if (!CurrentUser.isAuthenticated) {
        return false;
      }

      try {
        const experimentConfig = await getExperimentLayer(
          groupsConstants.socialCommunityExperimentLayer
        );

        return experimentConfig?.showGroupExperiencesRedesign ?? false;
      } catch (e) {
        // no-op, return control
      }
      return false;
    },

    isGroupExperienceServersExperimentEnabled: async () => {
      if (!CurrentUser.isAuthenticated) {
        return false;
      }

      try {
        const experimentConfig = await getExperimentLayer(
          groupsConstants.aboutTabWithExperienceExperimentLayer
        );

        return experimentConfig?.showGroupExperienceServers ?? false;
      } catch (e) {
        // no-op, return control
      }
      return false;
    },

    /**
     * Call when the group About tab is shown. Logs layer exposure for enrolled users in both
     * treatment and control (same enrollment gate as `showGroupExperienceServers` on the layer),
     * but only when the viewed community has a visible linked experience.
     */
    exposeAboutTabExperiment: async hasVisibleLinkedExperience => {
      if (!CurrentUser.isAuthenticated || !hasVisibleLinkedExperience) {
        return;
      }

      try {
        const experimentConfig = await getExperimentLayer(
          groupsConstants.aboutTabWithExperienceExperimentLayer
        );

        if (
          experimentConfig != null &&
          Object.prototype.hasOwnProperty.call(experimentConfig, 'showGroupExperienceServers')
        ) {
          ExperimentationService.logLayerExposure(
            groupsConstants.aboutTabWithExperienceExperimentLayer
          );
        }
      } catch (e) {
        // no-op, return control
      }
    },

    getCommunityStoreSortOrderExperimentVariant: async () => {
      if (!CurrentUser.isAuthenticated) {
        return 'Updated';
      }

      try {
        const experimentConfig = await getExperimentLayer(groupsConstants.storeExperimentLayer);
        ExperimentationService.logLayerExposure(groupsConstants.storeExperimentLayer);

        return experimentConfig?.communityStoreSortOrder ?? 'Updated';
      } catch (e) {
        // no-op, return control
      }
      return 'Updated';
    }
  };
}

groupsModule.factory('groupExperimentsService', groupExperimentsService);

export default groupExperimentsService;
