import { httpService } from 'core-utilities';
import {
  createCodeUrlConfig,
  pullCrossDeviceLoginStatusUrlConfig,
  cancelCrossDeviceLoginCodeUrlConfig,
  getXDLDisplayCodeExperimentEnrollmentsUrlConfig,
  getAuthTokenServiceMetadataUrlConfig,
  XDLDisplayCodeExperimentParameters
} from '../constants/urlConstants';

export const createNewCode = () => {
  const urlConfig = createCodeUrlConfig();
  return httpService
    .post(urlConfig)
    .then(data => {
      return data;
    })
    .catch(e => console.debug(e));
};

export const pullCrossDeviceLoginStatus = formData => {
  const urlConfig = pullCrossDeviceLoginStatusUrlConfig();
  return httpService
    .post(urlConfig, formData)
    .then(data => {
      return data;
    })
    .catch(e => console.debug(e));
};

export const cancelCrossDeviceLoginCode = formData => {
  const urlConfig = cancelCrossDeviceLoginCodeUrlConfig();
  return httpService
    .post(urlConfig, formData)
    .then(data => {
      return data;
    })
    .catch(e => console.debug(e));
};

export const openModal = () => {
  // create a new code
  createNewCode().then(({ data }) => {
    if (data?.status === 'Created') {
      const event = new CustomEvent('OpenCrossDeviceLoginDisplayCodeModal', {
        detail: {
          code: data.code,
          privateKey: data.privateKey,
          imagePath: data.imagePath
        }
      });
      window.dispatchEvent(event);
    }
  });
};

export const getExperimentEnrollments = () => {
  const urlConfig = getXDLDisplayCodeExperimentEnrollmentsUrlConfig();
  const experimentParameters = {
    parameters: XDLDisplayCodeExperimentParameters.join(',')
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
