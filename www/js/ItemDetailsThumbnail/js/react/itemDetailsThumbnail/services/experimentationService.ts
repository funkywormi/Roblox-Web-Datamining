import { AxiosPromise, httpService } from 'core-utilities';
import experimentConstants from '../constants/experimentConstants';

export type TLCSortExperiementValues = {
  lcSortEnabled: boolean;
  refreshEnabled?: boolean;
  robuxInThumbnail?: boolean;
};

export const experimentationService = {
  getABTestEnrollment(
    projectId: number,
    layerName: string,
    parameters: string[]
  ): AxiosPromise<TLCSortExperiementValues> {
    return httpService.get(
      experimentConstants.url.getExperimentationValues(projectId, layerName, parameters)
    );
  }
};
