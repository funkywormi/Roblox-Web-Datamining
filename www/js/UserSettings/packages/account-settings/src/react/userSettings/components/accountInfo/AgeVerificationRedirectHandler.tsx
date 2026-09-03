import React, { useEffect } from "react";
import useAgeVerificationUpsell from "../../hooks/useAgeVerificationUpsell";
import { redirectQueryParam } from "../../utils/navigationUtils";
import {
  shouldDisplayInitialModal,
  signalRedirectionCheckComplete,
} from "../../utils/hybridViewUtils";

const AgeVerificationRedirectHandler = (): JSX.Element | null => {
  const {
    faeAvailable,
    idvAvailable,
    vpcForFaeAvailable,
    handleVpcForFaeClick,
    handleFAEClick,
    handleIDVClick,
    isLoading: isAgeVerificationUpsellLoading,
  } = useAgeVerificationUpsell();

  useEffect(() => {
    const shouldCheckForAgeVerificationRedirection = shouldDisplayInitialModal(
      redirectQueryParam.ageVerification,
    );

    if (!shouldCheckForAgeVerificationRedirection) {
      return;
    }

    if (!faeAvailable && vpcForFaeAvailable) {
      handleVpcForFaeClick();
    } else if (faeAvailable) {
      handleFAEClick();
    }

    signalRedirectionCheckComplete();
  }, [faeAvailable, vpcForFaeAvailable, isAgeVerificationUpsellLoading]);

  useEffect(() => {
    const shouldCheckForIdVerificationRedirection = shouldDisplayInitialModal(
      redirectQueryParam.idVerification,
    );

    if (!shouldCheckForIdVerificationRedirection) {
      return;
    }

    if (idvAvailable) {
      handleIDVClick();
    }

    signalRedirectionCheckComplete();
  }, [idvAvailable, isAgeVerificationUpsellLoading]);

  return null;
};

export default AgeVerificationRedirectHandler;
