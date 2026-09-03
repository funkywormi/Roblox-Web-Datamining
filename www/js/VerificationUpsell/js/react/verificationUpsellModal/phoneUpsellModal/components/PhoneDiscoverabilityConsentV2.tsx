import React, { useEffect, useCallback, useMemo } from 'react';
import { AccessManagementUpsellV2Service } from 'Roblox';
import {
  phoneNumberDiscoverabilityConsentFormType,
  friendDiscoveryAMPFeatureName,
  friendDiscoveryAMPNamespace,
  phoneUpsellModalSurfaceAccountInfo,
  phoneUpsellModalSurfaceFriendDiscoverySetting,
  phoneUpsellModalSurfaceHomeVoice,
  unknownPhoneUpsellModalSurface
} from '../constants/phoneDiscoverabilityConsentConstants';
import { originValues } from '../../common/constants/loggingConstants';

const PhoneDiscoverabilityConsentV2 = ({
  onHide,
  origin
}: {
  onHide: () => void;
  origin: string;
}): JSX.Element => {
  const surface = useMemo(() => {
    switch (origin) {
      case originValues.accountSettingsPage:
        return phoneUpsellModalSurfaceAccountInfo;
      case originValues.friendDiscoverySettingPage:
        return phoneUpsellModalSurfaceFriendDiscoverySetting;
      case originValues.homepage:
        return phoneUpsellModalSurfaceHomeVoice;
      default:
        return unknownPhoneUpsellModalSurface;
    }
  }, [origin]);

  const startUpsell = useCallback(async () => {
    await AccessManagementUpsellV2Service.startAccessManagementUpsell({
      featureName: friendDiscoveryAMPFeatureName,
      featureSpecificData: {
        consentFormType: phoneNumberDiscoverabilityConsentFormType,
        surface,
        context: origin
      },
      namespace: friendDiscoveryAMPNamespace
    }).finally(onHide);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line no-void
    void startUpsell();
  }, []);

  return <React.Fragment />;
};

export default PhoneDiscoverabilityConsentV2;
