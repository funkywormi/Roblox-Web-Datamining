import ExperimentationService from "@rbx/experimentation";
import { getCurrentUser } from "@rbx/www-common/user";

export const VIP_SERVERS_LAYER = "VIPServers.Web";

type InventoryExperimentValues = {
  enableInventoryUpdates?: unknown;
};

export type InventoryExperiments = {
  getInventoryUpdatesEnabled: () => Promise<boolean>;
  logExposure: () => void;
};

export const createInventoryExperiments = (): InventoryExperiments => {
  const experimentLayers: Record<string, Promise<InventoryExperimentValues> | undefined> = {};
  const getExperimentLayer = (layerName: string): Promise<InventoryExperimentValues> => {
    experimentLayers[layerName] ??= ExperimentationService.getAllValuesForLayer(layerName);

    return experimentLayers[layerName];
  };

  return {
    getInventoryUpdatesEnabled: async () => {
      if (!getCurrentUser()) {
        return false;
      }

      try {
        const experimentConfig = await getExperimentLayer(VIP_SERVERS_LAYER);

        return Boolean(experimentConfig.enableInventoryUpdates);
      } catch {
        // no-op, return control
      }
      return false;
    },

    logExposure: () => {
      if (!getCurrentUser()) {
        return;
      }

      try {
        ExperimentationService.logLayerExposure(VIP_SERVERS_LAYER);
      } catch {
        // no-op, a missing exposure must not block the page from rendering
      }
    },
  };
};
