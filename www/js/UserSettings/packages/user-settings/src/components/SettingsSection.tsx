import React, { ReactElement } from "react";
import classNames from "classnames";

export const SettingsSection = ({
  title,
  description,
  children,
  className = "",
  id = "",
}: {
  title?: string;
  description?: HTMLDivElement | ReactElement | string;
  children?: HTMLDivElement | ReactElement;
  className?: string;
  id?: string;
}): React.JSX.Element => {
  const settingsSectionClassNames = classNames("setting-section", className);

  return (
    <div id={id} className={settingsSectionClassNames}>
      {title && (
        <div className="container-header">
          <h3 className="setting-section-header font-header-2">{title}</h3>
        </div>
      )}
      {description && <div className="text container-header">{description}</div>}
      {children && <div>{children}</div>}
    </div>
  );
};

SettingsSection.defaultProps = {
  description: undefined,
  title: undefined,
  className: "",
  children: undefined,
  id: "",
};

export default SettingsSection;
