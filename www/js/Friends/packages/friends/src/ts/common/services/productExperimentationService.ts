import { AxiosPromise, httpService } from 'core-utilities';
import urlConstants from '../constants/urlConstants';
import FriendsExperimentationType from '../enums/FriendsExperimentationType';
import FriendsExperimentationValues from '../interfaces/FriendsExperimentationValues';

const { getFriendsExperimentationValuesUrl } = urlConstants;

export default {
  getFriendsExperimentationValues(
    values: Array<FriendsExperimentationType>
  ): AxiosPromise<FriendsExperimentationValues> {
    const urlConfig = {
      url: getFriendsExperimentationValuesUrl(),
      timeout: 2000,
      withCredentials: true
    };

    const data = {
      parameters: values.join(',')
    };

    return httpService.get(urlConfig, data);
  }
};
