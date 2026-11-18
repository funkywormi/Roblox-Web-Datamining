import { CurrentUser, ExperimentationService } from 'Roblox';
import inventoryModule from '../inventoryModule';

const VIP_SERVERS_LAYER = 'VIPServers.Web';

function inventoryExperimentsService() {
  'ngInject';

  const experimentLayers = {};
  const getExperimentLayer = async layerName => {
    if (!experimentLayers[layerName]) {
      experimentLayers[layerName] = ExperimentationService.getAllValuesForLayer(layerName);
    }

    return experimentLayers[layerName];
  };

  return {
    getInventoryUpdatesEnabled: async () => {
      if (!CurrentUser.isAuthenticated) {
        return false;
      }

      try {
        const experimentConfig = await getExperimentLayer(VIP_SERVERS_LAYER);

        return experimentConfig?.enableInventoryUpdates ?? false;
      } catch (e) {
        // no-op, return control
      }
      return false;
    },

    logExposure: () => {
      if (!CurrentUser.isAuthenticated) {
        return;
      }

      try {
        ExperimentationService.logLayerExposure(VIP_SERVERS_LAYER);
      } catch (e) {
        // no-op, a missing exposure must not block the page from rendering
      }
    }
  };
}

inventoryModule.factory('inventoryExperimentsService', inventoryExperimentsService);

export default inventoryExperimentsService;
