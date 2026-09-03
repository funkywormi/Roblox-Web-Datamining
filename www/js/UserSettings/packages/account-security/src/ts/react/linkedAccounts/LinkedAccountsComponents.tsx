import React from "react";
import { useTranslation } from "@rbx/core-scripts/react";
import { FeedbackBanner, TextInput } from "@rbx/foundation-ui";
import translationConstants from "./translationConstants";

// Shared primitives keep error presentation and username-entry behavior
// consistent across the request and review dialogs.
export const ActionError = ({
  translationKey = translationConstants.actionError,
}: {
  translationKey?: string;
} = {}): React.JSX.Element => {
  const { translate } = useTranslation();
  return (
    <FeedbackBanner
      className="linked-accounts-banner"
      variant="Emphasis"
      severity="Warning"
      layout="Stacked"
      title={translate(translationKey)}
    />
  );
};

export const UsernameInput = ({
  value,
  onChange,
  placeholder,
  testId,
  inputId,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  testId: string;
  inputId?: string;
}): React.JSX.Element => (
  <TextInput
    id={inputId}
    type="text"
    value={value}
    placeholder={placeholder}
    onChange={event => {
      onChange(event.currentTarget.value);
    }}
    data-testid={testId}
  />
);
