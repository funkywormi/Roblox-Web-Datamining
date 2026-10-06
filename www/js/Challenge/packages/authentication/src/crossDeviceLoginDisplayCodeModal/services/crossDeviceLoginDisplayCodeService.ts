import * as http from "@rbx/core-scripts/http";
import {
  createCodeUrlConfig,
  pullCrossDeviceLoginStatusUrlConfig,
  cancelCrossDeviceLoginCodeUrlConfig,
  getXDLDisplayCodeExperimentEnrollmentsUrlConfig,
  getAuthTokenServiceMetadataUrlConfig,
  XDLDisplayCodeExperimentParameters,
} from "../constants/urlConstants";
import { isCreatedCode, type CreatedCode } from "../utils/isCreatedCode";

export const createNewCode = () => {
  const urlConfig = createCodeUrlConfig();
  return http.post<Partial<CreatedCode>>(urlConfig).catch(e => {
    console.debug(e);
    return undefined;
  });
};

export const pullCrossDeviceLoginStatus = (formData: Record<string, unknown>) => {
  const urlConfig = pullCrossDeviceLoginStatusUrlConfig();
  return http.post(urlConfig, formData).catch(e => {
    console.debug(e);
    return undefined;
  });
};

export const cancelCrossDeviceLoginCode = (formData: Record<string, unknown>) => {
  const urlConfig = cancelCrossDeviceLoginCodeUrlConfig();
  return http.post(urlConfig, formData).catch(e => {
    console.debug(e);
    return undefined;
  });
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
