import React, { ReactNode } from "react";

type Props = {
  className?: string;
  desktopLabel?: string | React.JSX.Element;
  mobileLabel?: string | React.JSX.Element;
  inputId: string;
  children: ReactNode;
};

export const CollapsibleUserInput = ({
  className = "",
  desktopLabel = "",
  mobileLabel = "",
  inputId,
  children,
}: Props): React.JSX.Element => {
  return (
    <div className={`collapsible-user-input ${className}`}>
      <label className="text-title-large account-info-inline-label label-mobile" htmlFor={inputId}>
        {mobileLabel}
      </label>
      <label className="text-title-large account-info-inline-label label-desktop" htmlFor={inputId}>
        {desktopLabel}
      </label>
      <div className="col-xs-12 col-sm-6" id={inputId}>
        {children}
      </div>
    </div>
  );
};

CollapsibleUserInput.defaultProps = {
  className: "",
};

export default CollapsibleUserInput;
