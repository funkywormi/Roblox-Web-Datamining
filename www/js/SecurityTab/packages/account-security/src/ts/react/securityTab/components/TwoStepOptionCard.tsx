import React from "react";
import { MediaType } from "../../challenge/twoStepVerification";
import { SecurityTabResources } from "../constants/resources";

type OptionContent = {
  title: string;
  description: string;
};

type TwoStepOptionCardProps = {
  id: string;
  mediaType: MediaType;
  isSelected: boolean;
  /** True when 2SV options are greyed out (EPP enrolled). */
  isDisabled: boolean;
  content: OptionContent;
  enabledMediaTypes: MediaType[];
  resources: SecurityTabResources;
  onSelectionChange: (mediaType: MediaType) => void;
  manageSecurityKey: () => Promise<void>;
};

/**
 * Individual radio card component for 2-Step Verification options
 *
 * This component renders a single option (Authenticator, Email, or Security Key)
 * as a styled card with a radio button
 * It should receive all necessary data and handlers as props.
 */
const TwoStepOptionCard: React.FC<TwoStepOptionCardProps> = ({
  id,
  mediaType,
  isSelected,
  isDisabled,
  content,
  enabledMediaTypes,
  resources,
  onSelectionChange,
  manageSecurityKey,
}) => {
  // isDisabled: 2SV options are greyed out (EPP enrolled).
  const isSecurityKeyCard = mediaType === MediaType.SecurityKey;
  const isSecurityKeyEnabled = enabledMediaTypes.includes(MediaType.SecurityKey);
  const isAuthenticatorEnabled = enabledMediaTypes.includes(MediaType.Authenticator);
  // Authenticator is a prerequisite for security keys; without either, Manage errors.
  const canOpenSecurityKeyManage = isSecurityKeyEnabled || isAuthenticatorEnabled;

  // Default: Manage only for the active security-key method.
  const isActiveSecurityKeyMethod = isSecurityKeyCard && isSelected && isSecurityKeyEnabled;
  // EPP: show Manage only if they already have a security key or authenticator.
  const shouldShowManageButton =
    isActiveSecurityKeyMethod || (isSecurityKeyCard && isDisabled && canOpenSecurityKeyManage);
  // Don't grey the card when Manage is available — only other locked 2SV options.
  const shouldGreyOutCard = isDisabled && !shouldShowManageButton;

  // Default: hide selected UI when locked. EPP: keep it on the security-key method.
  const showAsSelected = isSecurityKeyCard ? isSelected : isSelected && !isDisabled;

  const handleCardClick = () => {
    if (!isDisabled) {
      onSelectionChange(mediaType);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleCardClick();
    }
  };

  return (
    <div
      className={`section-content notifications-section ${
        showAsSelected ? "two-step-radio-card-selected" : ""
      }`}
      style={{
        marginBottom: "12px",
        cursor: isDisabled ? "not-allowed" : "pointer",
        opacity: shouldGreyOutCard ? 0.5 : 1,
      }}
      role="button"
      tabIndex={isDisabled ? -1 : 0}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
    >
      <div
        data-testid={`${id}-content`}
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        <div
          className="security-2svsetting-label btn-toggle-label"
          style={{ flex: 1, marginRight: "16px" }}
        >
          <h4 className="text-title-large gap-y-small" style={{ margin: 0 }}>
            {content.title}
          </h4>
          <div className="text-body-medium">{content.description}</div>
        </div>

        <div style={{ flexShrink: 0, paddingTop: "4px" }}>
          <input
            type="radio"
            name="two-step-verification-method"
            id={id}
            data-testid={id}
            value={mediaType}
            disabled={isDisabled}
            checked={showAsSelected}
            style={{
              width: "20px",
              height: "20px",
              cursor: isDisabled ? "not-allowed" : "pointer",
            }}
          />
        </div>
      </div>

      {shouldShowManageButton && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "12px" }}>
          <button
            type="button"
            id="manage-security-keys"
            data-testid="manage-security-keys"
            className="btn-control-sm acct-settings-btn"
            style={{ cursor: "pointer" }}
            onClick={e => {
              e.stopPropagation();
              manageSecurityKey().catch(() => {
                // Handles error silently since button click should not fail visibly
              });
            }}
          >
            {resources.Label.Manage}
          </button>
        </div>
      )}
    </div>
  );
};

export default TwoStepOptionCard;
