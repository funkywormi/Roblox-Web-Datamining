import React from "react";
import { MediaType } from "../../challenge/twoStepVerification";
import useTwoStepVerificationState from "./useTwoStepVerificationState";
import useTwoStepVerificationActions from "./useTwoStepVerificationActions";
import TwoStepOptionCard from "./TwoStepOptionCard";

type TwoStepOption = {
  id: string;
  mediaType: MediaType;
  available: boolean;
};

type TwoStepVerificationRadioOptionsProps = {
  isDisabled: boolean;
};

/**
 * Radio button interface for 2-Step Verification options
 *
 * This component replaces the individual toggle components with a unified
 * radio button interface where users can select one verification method at a time.
 * In the case of security key (requires authenticator before it's enabled), it will
 * redirect user to enabling authenticator first.
 */
const TwoStepVerificationRadioOptions: React.FC<TwoStepVerificationRadioOptionsProps> = ({
  isDisabled,
}) => {
  const state = useTwoStepVerificationState();
  const { selectedOption, getOptionContent } = state;

  const { handleOptionChange, manageSecurityKey } = useTwoStepVerificationActions();

  // Need to do this strict check to prevent linter errors
  const getSecurityKeyAvailability = (): boolean => {
    return Boolean(
      state.twoStepVerificationMetadata &&
        (
          state.twoStepVerificationMetadata as {
            isSecurityKeyTwoStepVerificationAvailable?: boolean;
          }
        ).isSecurityKeyTwoStepVerificationAvailable,
    );
  };

  // Define the available options with availability logic
  const options: TwoStepOption[] = [
    {
      id: "none",
      mediaType: MediaType.None,
      available: true,
    },
    {
      id: "email",
      mediaType: MediaType.Email,
      available: true,
    },
    {
      id: "authenticator-app",
      mediaType: MediaType.Authenticator,
      available: true,
    },
    {
      id: "security-key",
      mediaType: MediaType.SecurityKey,
      available: getSecurityKeyAvailability(),
    },
  ];

  return (
    <div className="two-step-radio-interface" data-testid="two-step-radio-interface">
      {options
        .filter(option => option.available)
        .map(option => (
          <TwoStepOptionCard
            key={option.id}
            id={option.id}
            mediaType={option.mediaType}
            isSelected={selectedOption === option.mediaType}
            isDisabled={isDisabled}
            content={getOptionContent(option.mediaType)}
            onSelectionChange={handleOptionChange}
            enabledMediaTypes={state.enabledMediaTypes}
            resources={state.resources}
            manageSecurityKey={manageSecurityKey}
          />
        ))}
    </div>
  );
};

export default TwoStepVerificationRadioOptions;
