import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-utilities";
import { Loading } from "react-style-guide";
import { Radio, RadioGroup } from "@rbx/foundation-ui";
import { RobuxTransferApprovalMode, TSettingOptionWithActions } from "@rbx/user-settings";
import { TRadioButtonOptionV2 } from "../../../../common/components/RadioButtonOptionsWithParentalConsent";
import SettingsSection from "../../../../common/components/SettingsSection";
import { filterRadioButtonOptions } from "../../../../../core/utils/settingOptionsUtils";
import commonTranslationConstants from "../../../constants/contentConstants/commonTranslationConstants";
import parentalControlsTranslationConstants from "../../../constants/contentConstants/parentalControlsTranslationConstants";

const { robuxTransferApprovals } = parentalControlsTranslationConstants;

const approvalOptionDescriptions: Record<RobuxTransferApprovalMode, string> = {
  [RobuxTransferApprovalMode.AlwaysAsk]: robuxTransferApprovals.alwaysAskDescription,
  [RobuxTransferApprovalMode.TrustedFriendsAutoApproved]:
    robuxTransferApprovals.alwaysAllowForTrustedFriendsDescription,
};

const getRobuxTransferApprovalOptions = (): TRadioButtonOptionV2[] => [
  {
    label: robuxTransferApprovals.alwaysAsk,
    value: RobuxTransferApprovalMode.AlwaysAsk,
    id: "robux-transfer-approval-always-ask",
    name: "robux-transfer-approval-always-ask",
  },
  {
    label: robuxTransferApprovals.alwaysAllowForTrustedFriends,
    value: RobuxTransferApprovalMode.TrustedFriendsAutoApproved,
    id: "robux-transfer-approval-trusted-friends",
    name: "robux-transfer-approval-trusted-friends",
  },
];

type RobuxTransferApprovalsFormProps = {
  // Saved mode from the settings query. Undefined while that read is still in flight.
  storedValue: RobuxTransferApprovalMode | undefined;
  options: TSettingOptionWithActions[] | undefined;
  isLoading?: boolean;
  isDisabled?: boolean;
  isError?: boolean;
  // A rejection puts the radios back on the saved mode.
  onChange: (value: RobuxTransferApprovalMode) => Promise<void> | void;
};

// The parent-facing Robux transfer approval choices, shared by the remote dashboard and Parent
// Zone. Each caller supplies the saved mode and its own save.
export const RobuxTransferApprovalsForm = ({
  storedValue,
  options,
  isLoading = false,
  isDisabled = false,
  isError = false,
  onChange,
}: RobuxTransferApprovalsFormProps): React.JSX.Element => {
  const { translate } = useTranslation();
  const [selectedValue, setSelectedValue] = useState(storedValue);

  useEffect(() => {
    if (storedValue != null) {
      setSelectedValue(storedValue);
    }
  }, [storedValue]);

  const saveApprovalMode = (newValue: RobuxTransferApprovalMode) => {
    if (newValue === selectedValue || isDisabled || storedValue == null) {
      return;
    }
    setSelectedValue(newValue);
    Promise.resolve(onChange(newValue)).catch(() => {
      if (storedValue != null) {
        setSelectedValue(storedValue);
      }
    });
  };

  const radioOptions = useMemo(() => {
    const availableOptions = filterRadioButtonOptions(
      getRobuxTransferApprovalOptions(),
      options ?? [],
    );
    return availableOptions.map(option => ({
      ...option,
      description: translate(approvalOptionDescriptions[option.value as RobuxTransferApprovalMode]),
    }));
  }, [options, translate]);

  const pageDescription = translate(robuxTransferApprovals.parentSideDescription);
  if (isLoading) {
    return (
      <SettingsSection description={pageDescription}>
        <Loading />
      </SettingsSection>
    );
  }
  if (isError) {
    return (
      <SettingsSection description={pageDescription}>
        <div className="text-error">{translate(commonTranslationConstants.unknownError)}</div>
      </SettingsSection>
    );
  }

  return (
    <SettingsSection description={pageDescription}>
      <div className="bg-shift-200 radius-medium padding-x-xlarge padding-y-large">
        {selectedValue != null && (
          <RadioGroup
            size="Medium"
            value={selectedValue}
            isDisabled={isDisabled}
            onValueChange={value => {
              saveApprovalMode(value as RobuxTransferApprovalMode);
            }}
          >
            {radioOptions.map(option => {
              const value = option.value as RobuxTransferApprovalMode;
              return (
                <Radio
                  key={option.id}
                  label={translate(option.label)}
                  value={value}
                  hint={option.description}
                />
              );
            })}
          </RadioGroup>
        )}
      </div>
    </SettingsSection>
  );
};

export default RobuxTransferApprovalsForm;
