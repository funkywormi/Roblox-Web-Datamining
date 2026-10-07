import { useEffect, useRef } from "react";
import { useTranslation } from "@rbx/core-scripts/react";
import PlusUpsellBanner from "@rbx/subscriptions-common/PlusUpsellBanner";
import type { SubscriptionOffer } from "@rbx/client-subscriptions-api/v2";
import { appThemeUpsellText } from "../../constants/contentConstants/browserPreferencesTranslationConstants";

export default function AppThemeUpsellBanner({
  eligibleOffers,
  isLoading,
  onFirstMount,
  onSubscribe,
}: {
  eligibleOffers?: SubscriptionOffer[];
  isLoading: boolean;
  onFirstMount: () => void;
  onSubscribe: () => void;
}) {
  const { translate } = useTranslation();

  const firstMount = useRef(true);
  useEffect(() => {
    if (!firstMount.current) {
      return;
    }
    firstMount.current = false;
    onFirstMount();
  }, [onFirstMount]);

  return (
    <PlusUpsellBanner
      appearance="Filled"
      eligibleOffers={eligibleOffers}
      isLoading={isLoading}
      testId="app-theme-upsell"
      upsellText={translate(appThemeUpsellText)}
      onClick={onSubscribe}
    />
  );
}
