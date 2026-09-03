import React from "react";
import classNames from "classnames";

export const SettingSubListItem = ({
  title,
  description,
  currentSettingValueComponent,
  metadata,
  showArrow,
  disabled,
  onClick,
  additionalClasses,
  id,
}: {
  title: string;
  description?: string;
  currentSettingValueComponent?: React.JSX.Element;
  metadata?: React.JSX.Element;
  showArrow?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  additionalClasses?: string;
  id?: string;
}): React.JSX.Element => {
  const btnClassNames = classNames("settings-list-item-container", {
    "text-disabled": disabled,
    [additionalClasses ?? ""]: additionalClasses,
  });

  return (
    <button id={id} className={btnClassNames} type="button" disabled={disabled} onClick={onClick}>
      <div className="settings-list-item-info">
        <span className="setting-name text-description">{title}</span>
        {description && <span className="text-description">{description}</span>}
      </div>
      {metadata}
      {(currentSettingValueComponent ?? showArrow) && (
        <div className="font-body settings-list-item-value-arrow">
          {currentSettingValueComponent}
          {showArrow && (
            <div>
              <span className="icon-chevron-heavy-right" />
            </div>
          )}
        </div>
      )}
    </button>
  );
};

SettingSubListItem.defaultProps = {
  description: undefined,
  currentSettingValueComponent: undefined,
  metadata: undefined,
  showArrow: false,
  disabled: false,
  onClick: undefined,
  additionalClasses: undefined,
  id: undefined,
};

export default SettingSubListItem;
