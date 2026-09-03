import React, { useEffect, useState } from "react";
import { useTranslation } from "react-utilities";
import { Button } from "react-style-guide";
import { QueryStatus } from "@reduxjs/toolkit/dist/query";
import { isMonthlyLimitOutOfRange, useSnackbar } from "@rbx/user-settings";
import {
  ParentConsentType,
  TConsentData,
  TGrantConsentRequest,
} from "../../../../../types/parentConsentsTypes";
import { useGetParentalSpendControlsQuery } from "../../../../apis/billingApi";
import { useInitiateConsentByParentMutation } from "../../../../apis/parentalControlsApi";
import SettingsSection from "../../../../common/components/SettingsSection";
import { TChildInfo } from "../../../../../types/childrenInfoTypes";
import parentalControlsTranslationConstants from "../../../constants/contentConstants/parentalControlsTranslationConstants";
import commonTranslationConstants from "../../../constants/contentConstants/commonTranslationConstants";
import { handleChildSettingsUpdateError } from "../../../utils/successMessageUtils";
import parentalControlsConstants from "../../../constants/parentalControls/parentalControlsConstants";
import { spendRestrictionsHelpUrl } from "../../../constants/urlConstants";

const ChildMonthlySpendingLimit = ({ child }: { child: TChildInfo }): JSX.Element => {
  const { translate } = useTranslation();
  const { snackbarService } = useSnackbar();

  const { spendControls } = parentalControlsTranslationConstants;

  const { data: spendControlSettings } = useGetParentalSpendControlsQuery(child.userId);
  const [updateChildSettings, { status: updateChildSettingsStatus }] =
    useInitiateConsentByParentMutation();

  const [currentMonthlySpendLimit, setCurrentMonthlySpendLimit] = useState<
    number | null | undefined
  >(spendControlSettings?.monthlySpendLimit);

  useEffect(() => {
    setCurrentMonthlySpendLimit(spendControlSettings?.monthlySpendLimit);
  }, [spendControlSettings]);

  const saveSpendRestrictionsHandler = async (newValue: number | null | undefined) => {
    const details: TConsentData = {
      monthlySpendLimit: newValue,
      monthlySpendLimitCurrencyCode:
        spendControlSettings?.monthlySpendLimitCurrencyType ??
        parentalControlsConstants.spendControls.defaultCurrencyCode,
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

  return (
    <SettingsSection
      description={
        <span
          dangerouslySetInnerHTML={{
            __html: translate(spendControls.parentSideSpendLimitDescription, {
              linkStart: `<a class="text-link" target="_blank" rel="noreferrer" href=${spendRestrictionsHelpUrl}>`,
              linkEnd: "</a>",
            }),
          }}
        />
      }
    >
      <div className="child-monthly-spending-limit">
        <label htmlFor="monthly-limit-input-icon">
          {translate(spendControls.monthlySpendingLimitLabel)}
        </label>
        <div className="form-group input-box monthly-limit-input-icon">
          <input
            className="form-control input-field input-number input-box"
            type="number"
            value={currentMonthlySpendLimit ?? undefined}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setCurrentMonthlySpendLimit(parseFloat(e.target.value))
            }
            placeholder={translate(spendControls.noLimit)}
          />
          <i>{spendControlSettings?.monthlySpendLimitCurrencyType}</i>
        </div>

        {/* Spend limit out of range error */}
        {isMonthlyLimitOutOfRange(currentMonthlySpendLimit, spendControlSettings) && (
          <div className="text-error">
            {translate(spendControls.spendLimitExceedRangeError, {
              maxSpendLimit: spendControlSettings?.maxMonthlySpendLimit,
            })}
          </div>
        )}

        <div className="update-spend-limit-btn-container">
          <Button
            isDisabled={
              isMonthlyLimitOutOfRange(currentMonthlySpendLimit, spendControlSettings) ||
              updateChildSettingsStatus === QueryStatus.pending
            }
            variant={Button.variants.primary}
            onClick={() => saveSpendRestrictionsHandler(currentMonthlySpendLimit)}
            width={Button.widths.min}
          >
            {translate(commonTranslationConstants.updateAction)}
          </Button>
        </div>
      </div>
    </SettingsSection>
  );
};

export default ChildMonthlySpendingLimit;
