import React, { useEffect, useState } from "react";
import { useTranslation } from "react-utilities";
import { Button, Loading } from "react-style-guide";
import {
  isRobuxTransferLimitOrderingInvalid,
  isRobuxTransferLimitOutOfRange,
  TRobuxTransferLimitCeilings,
  TRobuxTransferLimitsInput,
} from "@rbx/user-settings";
import SettingsSection from "../../../../common/components/SettingsSection";
import commonTranslationConstants from "../../../constants/contentConstants/commonTranslationConstants";
import parentalControlsTranslationConstants from "../../../constants/contentConstants/parentalControlsTranslationConstants";
import RobuxLimitField from "../parentDashboard/RobuxLimitField";

type RobuxTransferLimitsFormProps = {
  // Tier ceilings. Undefined once the read settles means the form cannot be bounded.
  ceilings: TRobuxTransferLimitCeilings | undefined;
  storedCaps: TRobuxTransferLimitsInput;
  isLoading: boolean;
  isError: boolean;
  // Blocks the save while a caller's own request is in flight.
  isSaving?: boolean;
  // Distinguishes the field ids when both parents' forms exist in one build.
  inputIdPrefix: string;
  onSave: (limits: TRobuxTransferLimitsInput) => Promise<void> | void;
};

// The parent-facing Robux transfer caps form, shared by the remote dashboard and Parent Zone. Each
// caller supplies its own reads and its own save; everything the two have in common lives here.
export const RobuxTransferLimitsForm = ({
  ceilings,
  storedCaps,
  isLoading,
  isError,
  isSaving = false,
  inputIdPrefix,
  onSave,
}: RobuxTransferLimitsFormProps): React.JSX.Element => {
  const { translate } = useTranslation();
  const { robuxTransferLimits } = parentalControlsTranslationConstants;
  const pageDescription = translate(robuxTransferLimits.parentSideDescription);

  const [limits, setLimits] = useState<TRobuxTransferLimitsInput>(storedCaps);

  // Keyed on the two caps rather than on the read they came from, so a read that arrives equal but
  // not identical does not set state on every render.
  useEffect(() => {
    setLimits({ daily: storedCaps.daily, monthly: storedCaps.monthly });
  }, [storedCaps.daily, storedCaps.monthly]);

  if (isLoading) {
    return (
      <SettingsSection description={pageDescription}>
        <Loading />
      </SettingsSection>
    );
  }

  // Without ceilings every field and validator is unbounded, so show an error rather than a form.
  if (isError || ceilings === undefined) {
    return (
      <SettingsSection description={pageDescription}>
        <div className="text-error">{translate(commonTranslationConstants.unknownError)}</div>
      </SettingsSection>
    );
  }

  const isOrderingInvalid = isRobuxTransferLimitOrderingInvalid(limits, ceilings);
  const isSaveBlocked =
    isRobuxTransferLimitOutOfRange(limits.daily, ceilings.tierDailyTransferLimit) ||
    isRobuxTransferLimitOutOfRange(limits.monthly, ceilings.tierMonthlyTransferLimit) ||
    isOrderingInvalid ||
    isSaving;

  return (
    <SettingsSection description={pageDescription}>
      <div className="flex flex-col gap-medium">
        <RobuxLimitField
          inputId={`${inputIdPrefix}-daily-transfer-limit`}
          labelKey={robuxTransferLimits.dailyLimitLabel}
          maxLabelKey={robuxTransferLimits.maximumDailyLimit}
          cap={limits.daily}
          tierCap={ceilings.tierDailyTransferLimit}
          placeholder={translate(robuxTransferLimits.noLimit)}
          onChange={daily => setLimits(current => ({ ...current, daily }))}
        />
        <RobuxLimitField
          inputId={`${inputIdPrefix}-monthly-transfer-limit`}
          labelKey={robuxTransferLimits.monthlyLimitLabel}
          maxLabelKey={robuxTransferLimits.maximumMonthlyLimit}
          cap={limits.monthly}
          tierCap={ceilings.tierMonthlyTransferLimit}
          placeholder={translate(robuxTransferLimits.noLimit)}
          onChange={monthly => setLimits(current => ({ ...current, monthly }))}
        />

        {isOrderingInvalid && (
          <div className="text-error">{translate(robuxTransferLimits.orderingError)}</div>
        )}

        <div className="flex justify-center margin-top-large">
          <Button
            isDisabled={isSaveBlocked}
            variant={Button.variants.primary}
            onClick={() => onSave(limits)}
            width={Button.widths.min}
          >
            {translate(commonTranslationConstants.updateAction)}
          </Button>
        </div>
      </div>
    </SettingsSection>
  );
};

export default RobuxTransferLimitsForm;
