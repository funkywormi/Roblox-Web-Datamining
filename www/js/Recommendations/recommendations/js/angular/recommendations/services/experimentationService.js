import { httpService } from 'core-utilities';
import { ExperimentationService } from 'Roblox';
import experimentConstants from '../constants/experimentConstants';
import recommendationsModule from '../recommendationsModule';

function experimentationService() {
  return {
    getABTestEnrollment(projectId, layerName, parameters) {
      const ixpPromise = ExperimentationService.getAllValuesForLayer(layerName);
      ixpPromise.then(() => {
        ExperimentationService.logLayerExposure(layerName);
      });
      return ixpPromise;
    }
  };
}
recommendationsModule.factory('experimentationService', experimentationService);

export default experimentationService;
