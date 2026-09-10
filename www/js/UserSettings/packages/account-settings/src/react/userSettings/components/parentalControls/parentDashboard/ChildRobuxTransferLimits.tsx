import React, { useEffect, useState } from "react";
import { useTranslation } from "react-utilities";
import { Button, Loading } from "react-style-guide";
import { QueryStatus } from "@reduxjs/toolkit/dist/query";
import {
  buildRobuxTransferLimitsConsentValue,
  isRobuxTransferLimitOrderingInvalid,
  isRobuxTransferLimitOutOfRange,
  toRobuxTransferLimitsInputFromSetting,
  TRobuxTransferLimitsInput,
  useSnackbar,
  UserSetting,
} from "@rbx/user-settings";
import {
  ParentConsentType,
  TConsentData,
  TGrantConsentRequest,
} from "../../../../../types/parentConsentsTypes";
import { TChildInfo } from "../../../../../types/childrenInfoTypes";
import { useGetChildTransferLimitQuery } from "../../../../apis/transferLimitsApi";
import { useInitiateConsentByParentMutation } from "../../../../apis/parentalControlsApi";
import useGetSettingsAndOptionsV2 from "../../../../apis/hooks/useGetSettingsAndOptionsV2";
import SettingsSection from "../../../../common/components/SettingsSection";
import commonTranslationConstants from "../../../constants/contentConstants/commonTranslationConstants";
import parentalControlsTranslationConstants from "../../../constants/contentConstants/parentalControlsTranslationConstants";
import { handleChildSettingsUpdateError } from "../../../utils/successMessageUtils";
import RobuxLimitField from "./RobuxLimitField";

const ChildRobuxTransferLimits = ({ child }: { child: TChildInfo }): JSX.Element => {
  const { translate } = useTranslation();
  const { snackbarService } = useSnackbar();
  const { spendControls, robuxTransferLimits } = parentalControlsTranslationConstants;
  const pageDescription = translate(robuxTransferLimits.parentSideDescription);

  // The caps the parent has already saved come from user-settings, which owns
  // them; transfer-api supplies only the tier ceilings.
  const {
    data: transferLimits,
    isLoading: isTransferLimitsLoading,
    isError: isTransferLimitsError,
  } = useGetChildTransferLimitQuery(child.userId);
  const [childSettings, isChildSettingsLoading, isChildSettingsError] = useGetSettingsAndOptionsV2(
    child.userId,
  );
  const [updateChildSettings, { status: updateChildSettingsStatus }] =
    useInitiateConsentByParentMutation();

  const storedCaps = toRobuxTransferLimitsInputFromSetting(childSettings?.robuxTransferLimits);

  const [limits, setLimits] = useState<TRobuxTransferLimitsInput>(storedCaps);

  // Keyed on the two caps rather than on the read they came from. Re-prefilling
  // always produces a fresh object, so a read that arrives equal but not identical
  // would otherwise set state on every render and never settle.
  useEffect(() => {
    setLimits({ daily: storedCaps.daily, monthly: storedCaps.monthly });
  }, [storedCaps.daily, storedCaps.monthly]);

  const saveTransferLimitsHandler = async () => {
    const details: TConsentData = {
      [UserSetting.robuxTransferLimits]: buildRobuxTransferLimitsConsentValue(limits),
    };
    const updateBody: TGrantConsentRequest = {
      childUserId: child.userId,
      consentType: ParentConsentType.UpdateUserSetting,
      details,
    };
    try {
      await updateChildSettings(updateBody).unwrap();
      snackbarService.success(translate(commonTranslationConstants.successDialogMessage));
    } catch (error) {
      const errorKey = handleChildSettingsUpdateError(error, child.userId);
      if (errorKey) {
        snackbarService.warning(translate(errorKey));
      }
    }
  };

  // Both reads back the form — tier ceilings bound every field and validator,
  // and the stored caps prefill it — so show a spinner until both resolve.
  if (isTransferLimitsLoading || isChildSettingsLoading) {
    return (
      <SettingsSection description={pageDescription}>
        <Loading />
      </SettingsSection>
    );
  }

  // A resolved-but-missing tier read leaves every field and validator unbounded,
  // so surface an error rather than an empty or broken form.
  if (isTransferLimitsError || isChildSettingsError || transferLimits === undefined) {
    return (
      <SettingsSection description={pageDescription}>
        <div className="text-error">{translate(commonTranslationConstants.unknownError)}</div>
      </SettingsSection>
    );
  }

  const isOrderingInvalid = isRobuxTransferLimitOrderingInvalid(limits, transferLimits);
  // Both windows travel on every save, so a save is blocked until each is within
  // its tier ceiling and correctly ordered; the form only renders once the stored
  // caps have loaded, so the prefill can no longer be submitted empty.
  const isSaveBlocked =
    isRobuxTransferLimitOutOfRange(limits.daily, transferLimits.tierDailyTransferLimit) ||
    isRobuxTransferLimitOutOfRange(limits.monthly, transferLimits.tierMonthlyTransferLimit) ||
    isOrderingInvalid ||
    updateChildSettingsStatus === QueryStatus.pending;

  return (
    <SettingsSection description={pageDescription}>
      <div className="flex flex-col gap-medium">
        <RobuxLimitField
          inputId="robux-daily-transfer-limit"
          labelKey={robuxTransferLimits.dailyLimitLabel}
          maxLabelKey={robuxTransferLimits.maximumDailyLimit}
          cap={limits.daily}
          tierCap={transferLimits.tierDailyTransferLimit}
          placeholder={translate(spendControls.noLimit)}
          onChange={daily => setLimits(current => ({ ...current, daily }))}
        />
        <RobuxLimitField
          inputId="robux-monthly-transfer-limit"
          labelKey={robuxTransferLimits.monthlyLimitLabel}
          maxLabelKey={robuxTransferLimits.maximumMonthlyLimit}
          cap={limits.monthly}
          tierCap={transferLimits.tierMonthlyTransferLimit}
          placeholder={translate(spendControls.noLimit)}
          onChange={monthly => setLimits(current => ({ ...current, monthly }))}
        />

        {isOrderingInvalid && (
          <div className="text-error">{translate(robuxTransferLimits.orderingError)}</div>
        )}

        <div className="flex justify-center margin-top-large">
          <Button
            isDisabled={isSaveBlocked}
            variant={Button.variants.primary}
            onClick={saveTransferLimitsHandler}
            width={Button.widths.min}
          >
            {translate(commonTranslationConstants.updateAction)}
          </Button>
        </div>
      </div>
    </SettingsSection>
  );
};

export default ChildRobuxTransferLimits;
