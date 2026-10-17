import React, { useCallback } from "react";
import { withTranslations, WithTranslationsProps } from "react-utilities";
import translationConfig from "../translation.config";
import Constants from "../constants/Constants";

type SaveBillingInfoProps = {
  disabled?: boolean;
  saveBillingInfo: boolean;
  setSaveBillingInfo: React.Dispatch<React.SetStateAction<boolean>>;
} & WithTranslationsProps;

const {
  saveBillingInformationLabel: { key: saveBillingInfoKey, default: saveBillingInfoDefault },
} = Constants.translations;

/**
 * A check box for the user preference to save billing address to their account.
 */
const SaveBillingInformationCheckBox: React.FC<SaveBillingInfoProps> = ({
  disabled = false,
  saveBillingInfo,
  setSaveBillingInfo,
  translate,
}) => {
  const onCheckBoxChanged = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSaveBillingInfo(event.target.checked);
    },
    [setSaveBillingInfo],
  );

  return (
    <div className="save-billing-info-checkbox">
      <input
        id="save-billing-info"
        type="checkbox"
        className="larger-checkbox"
        onChange={onCheckBoxChanged}
        checked={saveBillingInfo}
        disabled={disabled}
        tabIndex={0}
      />
      <label htmlFor="save-billing-info" className="form-label">
        {translate(saveBillingInfoKey) || saveBillingInfoDefault}
      </label>
    </div>
  );
};

export default withTranslations(SaveBillingInformationCheckBox, translationConfig);
