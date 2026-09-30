import * as http from "@rbx/core-scripts/http";
import {
  createCodeUrlConfig,
  pullCrossDeviceLoginStatusUrlConfig,
  cancelCrossDeviceLoginCodeUrlConfig,
  getXDLDisplayCodeExperimentEnrollmentsUrlConfig,
  getAuthTokenServiceMetadataUrlConfig,
  XDLDisplayCodeExperimentParameters,
} from "../constants/urlConstants";
import { isCreatedCode } from "../utils/isCreatedCode";

export const createNewCode = () => {
  const urlConfig = createCodeUrlConfig();
  return http
    .post(urlConfig)
    .then(data => {
      return data;
    })
    .catch(e => console.debug(e));
};

export const pullCrossDeviceLoginStatus = formData => {
  const urlConfig = pullCrossDeviceLoginStatusUrlConfig();
  return http
    .post(urlConfig, formData)
    .then(data => {
      return data;
    })
    .catch(e => console.debug(e));
};

export const cancelCrossDeviceLoginCode = formData => {
  const urlConfig = cancelCrossDeviceLoginCodeUrlConfig();
  return http
    .post(urlConfig, formData)
    .then(data => {
      return data;
    })
    .catch(e => console.debug(e));
};

export const CODE_MODAL_OPEN_EVENT = "OpenCrossDeviceLoginDisplayCodeModal";
export const CODE_MODAL_CLOSE_EVENT = "CloseCrossDeviceLoginDisplayCodeModal";

/** Opens the code modal with a new code, resolving whether it opened. */
export const openModal = async () => {
  const data = (await createNewCode())?.data;
  if (!isCreatedCode(data)) {
    return false;
  }
  window.dispatchEvent(
    new CustomEvent(CODE_MODAL_OPEN_EVENT, {
      detail: {
        code: data.code,
        privateKey: data.privateKey,
        imagePath: data.imagePath,
      },
    }),
  );
  return true;
};

export const getExperimentEnrollments = () => {
  const urlConfig = getXDLDisplayCodeExperimentEnrollmentsUrlConfig();
  const experimentParameters = {
    parameters: XDLDisplayCodeExperimentParameters.join(","),
  };
  return http.get(urlConfig, experimentParameters).then(response => {
    if (response?.data) {
      return response.data;
    }
    return Promise.reject();
  });
};

export const getMetadata = () => {
  return http.get(getAuthTokenServiceMetadataUrlConfig());
};
