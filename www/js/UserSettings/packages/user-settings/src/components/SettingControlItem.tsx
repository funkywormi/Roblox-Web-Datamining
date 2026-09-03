import React from "react";

export type SettingControlItemProps = {
  id: string;
  label: string;
  description?: string;
  thumbnail?: React.ReactNode;
  control: React.ReactNode;
  /** Optional class(es) appended to the label element (e.g. foundation color utilities). */
  labelClassName?: string;
  /** Optional class(es) appended to the description element. */
  descriptionClassName?: string;
};

export const SettingControlItem = ({
  id,
  label,
  description,
  thumbnail,
  control,
  labelClassName,
  descriptionClassName,
}: SettingControlItemProps): React.JSX.Element => {
  return (
    <div className="settings-list-item-container">
      <div className="flex gap-small">
        {thumbnail && (
          <div className="settings-list-item-thumbnail size-[50px] shrink-0 clip radius-small">
            {thumbnail}
          </div>
        )}
        <div className="settings-list-item-info">
          <label
            htmlFor={id}
            className={`setting-name font-body${labelClassName ? ` ${labelClassName}` : ""}`}
          >
            {label}
          </label>
          {description && (
            <span className={`small text${descriptionClassName ? ` ${descriptionClassName}` : ""}`}>
              {description}
            </span>
          )}
        </div>
      </div>
      <div className="settings-list-item-value-arrow">{control}</div>
    </div>
  );
};

export default SettingControlItem;
