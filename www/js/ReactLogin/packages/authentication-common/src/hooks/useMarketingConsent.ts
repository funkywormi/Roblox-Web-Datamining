import { useCallback, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MARKETING_CONSENT_MINIMUM_AGE } from "../constants/marketingConsentConstants";
import * as accountUpgradeAnalytics from "../services/accountUpgradeAnalytics";
import {
  getAutoOptInAuditHeader,
  getCheckboxAuditHeader,
  getMarketingConsentOptInMethod,
  sendMarketingConsent,
} from "../services/marketingConsentService";
import { isUnderAge } from "../utils/birthdayUtils";

export type UseMarketingConsentOptions = {
  birthday: Date | null | undefined;
  consentText: string;
};

export type MarketingConsent = {
  text: string | undefined;
  isChecked: boolean;
  isDisabled: boolean;
  onToggle: () => void;
  startWrite: () => Promise<void> | undefined;
};

function useMarketingConsent({
  birthday,
  consentText,
}: UseMarketingConsentOptions): MarketingConsent {
  const { data: optInMethod } = useQuery({
    queryKey: ["marketing-consent-opt-in-method"],
    queryFn: getMarketingConsentOptInMethod,
    cacheTime: 0,
    retry: false,
  });

  const isUnderMinimumAge =
    birthday instanceof Date && isUnderAge(birthday, MARKETING_CONSENT_MINIMUM_AGE);
  const isOldEnough = birthday instanceof Date && !isUnderMinimumAge;

  const isBoxVisible = optInMethod === "Checkbox" && consentText !== "";
  const isBoxEnabled = isBoxVisible && !isUnderMinimumAge;

  // The box clears each time it hides or becomes disabled, so every check comes from the user.
  const [isChecked, setIsChecked] = useState(false);
  if (!isBoxEnabled && isChecked) {
    setIsChecked(false);
  }

  useEffect(() => {
    if (isBoxVisible) {
      accountUpgradeAnalytics.reportMarketingConsentShown();
    }
  }, [isBoxVisible]);

  const onToggle = useCallback(() => {
    if (!isBoxEnabled) {
      return;
    }
    const nextIsChecked = !isChecked;
    setIsChecked(nextIsChecked);
    accountUpgradeAnalytics.reportMarketingConsentToggled(nextIsChecked);
  }, [isBoxEnabled, isChecked]);

  const startWrite = useCallback((): Promise<void> | undefined => {
    if (!isOldEnough) {
      return undefined;
    }
    let write: Promise<void> | undefined;
    // Each branch starts the write before its report, so a report that throws cannot stop the
    // write.
    try {
      if (optInMethod === "AutoOptIn") {
        write = sendMarketingConsent(getAutoOptInAuditHeader());
        accountUpgradeAnalytics.reportMarketingConsentAutoOptIn();
      } else if (isBoxVisible) {
        if (isChecked) {
          write = sendMarketingConsent(getCheckboxAuditHeader(consentText));
        }
        accountUpgradeAnalytics.reportMarketingConsentSubmitted(isChecked);
      }
    } catch {
      // startWrite runs in the upgrade's success path, so it must never throw.
    }
    return write;
  }, [consentText, isBoxVisible, isChecked, isOldEnough, optInMethod]);

  return {
    text: isBoxVisible ? consentText : undefined,
    isChecked,
    isDisabled: isBoxVisible && isUnderMinimumAge,
    onToggle,
    startWrite,
  };
}

export default useMarketingConsent;
