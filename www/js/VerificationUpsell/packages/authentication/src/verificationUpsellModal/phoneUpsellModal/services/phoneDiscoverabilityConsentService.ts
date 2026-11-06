import { UserSettingsMetadataResponse } from "../../common/types/apiTypes";
import {
  getPhoneDiscoverabilityPageMetadataConfig,
  setPhoneDiscoverabilityConsentConfig,
} from "../../common/constants/urlConstants";
import transport from "../../../shared/request/requestTransport";

export const getPhoneDiscoverabilityPageMetadata = () => {
  const urlConfig = getPhoneDiscoverabilityPageMetadataConfig();
  return transport.get<UserSettingsMetadataResponse>(urlConfig).then(
    data => {
      return data;
    },
    e => {
      return null;
    },
  );
};

export const setPhoneDiscoverabilityConsent = (phoneNumberDiscoverability: string) => {
  const urlConfig = setPhoneDiscoverabilityConsentConfig();
  const formData = {
    phoneNumberDiscoverability,
  };
  return transport
    .post(urlConfig, formData)
    .then(data => {
      return true;
    })
    .catch(() => {
      return false;
    });
};
