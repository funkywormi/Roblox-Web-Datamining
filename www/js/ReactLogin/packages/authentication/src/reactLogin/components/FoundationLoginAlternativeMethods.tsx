import React from "react";
import { Button } from "@rbx/foundation-ui";

export type FoundationLoginAlternativeMethodsProps = {
  children: React.ReactNode;
  otherSignInOptionsLabel: string;
  onOtherSignInOptions?: () => void;
};

const FoundationLoginAlternativeMethods = ({
  children,
  otherSignInOptionsLabel,
  onOtherSignInOptions,
}: FoundationLoginAlternativeMethodsProps): React.JSX.Element => (
  <div className="flex width-full flex-col gap-small" data-testid="login-alternative-methods">
    {children}
    {onOtherSignInOptions && (
      <Button
        className="width-full"
        type="button"
        size="Medium"
        variant="Standard"
        onClick={onOtherSignInOptions}
      >
        {otherSignInOptionsLabel}
      </Button>
    )}
  </div>
);

export default FoundationLoginAlternativeMethods;
