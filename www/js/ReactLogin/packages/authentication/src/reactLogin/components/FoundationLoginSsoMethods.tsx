import React from "react";
import SsoProviderButtons from "../../shared/components/SsoProviderButtons";
import type { SsoProviderButtonConfig } from "../../shared/components/SsoProviderButtons";
import FoundationLoginAlternativeMethods from "./FoundationLoginAlternativeMethods";

export type FoundationLoginSsoMethodsProps = {
  providers: readonly SsoProviderButtonConfig[];
  otherSignInOptionsLabel: string;
  onOtherSignInOptions?: () => void;
};

const FoundationLoginSsoMethods = ({
  providers,
  otherSignInOptionsLabel,
  onOtherSignInOptions,
}: FoundationLoginSsoMethodsProps): React.JSX.Element => (
  <FoundationLoginAlternativeMethods
    otherSignInOptionsLabel={otherSignInOptionsLabel}
    onOtherSignInOptions={onOtherSignInOptions}
  >
    <SsoProviderButtons providers={providers} />
  </FoundationLoginAlternativeMethods>
);

export default FoundationLoginSsoMethods;
