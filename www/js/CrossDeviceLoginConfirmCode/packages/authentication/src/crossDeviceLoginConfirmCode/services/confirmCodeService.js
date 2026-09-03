import { httpService } from 'core-utilities';
import { eventStreamService } from 'core-roblox-utilities';
import {
  postEnterCodeUrlConfig,
  postValidateCodeUrlConfig,
  postCancelCodeUrlConfig,
  getExperimentEnrollmentsUrlConfig,
  getAuthTokenServiceMetadataUrlConfig,
  confirmCodeExperimentParameters
} from '../constants/urlConstants';

export const sendCodeConfirmEvent = event => {
  eventStreamService.sendEventWithTarget(event.type, event.context, {
    ...event.params
  });
};

export const enterCode = code => {
  const urlConfig = postEnterCodeUrlConfig();
  const postData = {
    code
  };
  return httpService.post(urlConfig, postData).then(({ data }) => {
    return data;
  });
};

export const validateCode = code => {
  const urlConfig = postValidateCodeUrlConfig();
  const data = {
    code
  };
  return httpService.post(urlConfig, data).then(() => {
    return true;
  });
};

export const cancelCode = code => {
  const urlConfig = postCancelCodeUrlConfig();
  const data = {
    code
  };
  return httpService
    .post(urlConfig, data)
    .then(() => {
      return true;
    })
    .catch(e => console.debug(e));
};

export const getExperimentEnrollments = () => {
  const urlConfig = getExperimentEnrollmentsUrlConfig();
  const experimentParameters = {
    parameters: confirmCodeExperimentParameters.join(',')
  };
  return httpService.get(urlConfig, experimentParameters).then(response => {
    if (response?.data) {
      return response.data;
    }
    return Promise.reject();
  });
};

export const getMetadata = () => {
  return httpService.get(getAuthTokenServiceMetadataUrlConfig());
};
