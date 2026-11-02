import React from "react";
import { Button, Icon } from "@rbx/foundation-ui";
import type { SsoProvider } from "../types/ssoTypes";
import GoogleLogo from "./GoogleLogo";

export type SsoProviderButtonConfig = {
  provider: SsoProvider;
  label: string;
  onClick: () => void;
  isDisabled?: boolean;
  isLoading?: boolean;
};

export type SsoProviderButtonsProps = {
  providers: readonly SsoProviderButtonConfig[];
  layout?: "row" | "column";
};

const SsoProviderButtons = ({
  providers,
  layout = "row",
}: SsoProviderButtonsProps): React.JSX.Element => (
  <div
    className={`flex width-full gap-small ${layout === "row" ? "flex-row" : "flex-col"}`}
    data-testid="sso-provider-buttons"
  >
    {providers.map(({ provider, label, onClick, isDisabled, isLoading }) => (
      <Button
        key={provider}
        className={`width-full ${layout === "row" ? "grow-1 basis-0" : ""}`}
        type="button"
        size="Medium"
        variant="Standard"
        isDisabled={isDisabled}
        isLoading={isLoading}
        onClick={onClick}
        data-sso-provider={provider}
      >
        <span className="flex items-center justify-center gap-small">
          {provider === "google" ? (
            <GoogleLogo />
          ) : (
            <Icon name="icon-filled-apple" size="Small" aria-hidden="true" />
          )}
          <span>{label}</span>
        </span>
      </Button>
    ))}
  </div>
);

export default SsoProviderButtons;
