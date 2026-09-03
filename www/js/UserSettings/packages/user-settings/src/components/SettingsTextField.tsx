import React, { ReactNode } from "react";
import { Button } from "@rbx/foundation-ui";

export interface SettingsTextFieldLine {
  value: string;
  metadataBody?: ReactNode;
}

interface SettingsTextFieldProps {
  id?: string;
  label: string;
  lines: SettingsTextFieldLine[];
  valueSet: boolean;
  primaryEditLabel: string;
  primaryOnEdit: () => void;
  primaryActionId?: string;
  secondaryEditLabel?: string;
  secondaryOnEdit?: () => void;
  displayEditButton?: boolean;
}

export const SettingsTextField: React.FC<SettingsTextFieldProps> = ({
  id = "",
  label,
  lines,
  valueSet,
  primaryEditLabel,
  primaryOnEdit,
  primaryActionId = "",
  secondaryEditLabel = "",
  secondaryOnEdit = () => null,
  displayEditButton = true,
}) => {
  const primaryAction = (
    <Button
      variant={secondaryEditLabel ? "Emphasis" : "Standard"}
      size="Small"
      onClick={primaryOnEdit}
      id={primaryActionId}
    >
      {primaryEditLabel}
    </Button>
  );

  const secondaryAction = (
    <Button variant="Standard" size="Small" onClick={secondaryOnEdit}>
      {secondaryEditLabel}
    </Button>
  );

  const textActionBody = (
    <div className="account-field-settings-text">
      {primaryAction}
      {secondaryEditLabel && secondaryAction}
    </div>
  );

  const editActionBody = valueSet ? (
    <button
      type="button"
      className="account-change-settings-button btn-generic-edit-sm"
      title={primaryEditLabel}
      aria-label={primaryEditLabel}
      onClick={primaryOnEdit}
      id={primaryActionId}
      data-testid="setting-text-field-edit-btn"
    >
      <span className="icon-edit" />
    </button>
  ) : (
    textActionBody
  );

  return (
    <div className="form-group settings-text-field-container" id={id}>
      <div className="account-settings-text-field">
        <span className="text-title-large account-info-inline-label">{label}</span>
        <div className="settings-text-lines-container">
          {lines.map((line, index) => (
            <div key={line.value || index} className="account-settings-value-metadata-container">
              <span className="settings-text-span-visible text-body-medium">{line.value}</span>
              <span>{line.metadataBody}</span>
            </div>
          ))}
        </div>
      </div>
      {displayEditButton && editActionBody}
    </div>
  );
};

export default SettingsTextField;
