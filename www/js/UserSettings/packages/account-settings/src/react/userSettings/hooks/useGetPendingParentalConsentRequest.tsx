import { useMemo } from "react";
import { authenticatedUser } from "header-scripts";
import { UserSetting } from "@rbx/user-settings";
import {
  ParentConsentStatus,
  TConsentResponse,
  ParentConsentType,
} from "../../../types/parentConsentsTypes";
import { useGetParentalConsentsQuery } from "../../apis/parentalControlsApi";
import { getFirstSettingNameInConsentData } from "../utils/parentalControls/parentalConsentUtils";

/**
 * Custom hook to get the authenticated user's pending parental consent request for a specific consent type.
 *
 * @param consentType - The type of parental consent.
 * @param settingName - The name of the requested setting (required for UpdateUserSetting type).
 * @returns The pending parental consent for the specified setting, if any.
 */
const useGetPendingParentalConsentRequest = (
  consentType: ParentConsentType,
  settingName?: UserSetting,
): TConsentResponse | undefined => {
  const { data: parentalConsents } = useGetParentalConsentsQuery({
    childUserId: authenticatedUser.id!,
    consentStatus: ParentConsentStatus.Pending,
    consentType,
  });

  const pendingConsent = useMemo(() => {
    const consents: TConsentResponse[] = parentalConsents?.consents ?? [];

    switch (consentType) {
      case ParentConsentType.UpdateUserSetting:
        return consents.find(consent => getFirstSettingNameInConsentData(consent) === settingName);
      case ParentConsentType.UpdateBirthdate:
        // For UpdateBirthdate, there's only one possible consent per user
        return consents[0];
      default:
        return undefined;
    }
  }, [consentType, parentalConsents, settingName]);

  return pendingConsent;
};

export default useGetPendingParentalConsentRequest;
