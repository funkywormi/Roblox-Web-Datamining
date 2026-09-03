import React from "react";
import { Tooltip } from "react-style-guide";

type Props = {
  label?: string;
  inputId: string;
  showToolTip?: boolean;
  toolTipId?: string;
  toolTipText?: string;
  children: React.ReactNode;
};

/* 
  Pass translated text to this component
*/
export const StackedUserInput: React.FC<Props> = ({
  label,
  inputId,
  showToolTip,
  toolTipId,
  toolTipText,
  children,
}: Props) => {
  return (
    <div className="form-group stacked-user-input">
      <label className="font-header-2 text-label" htmlFor={inputId}>
        {label}
        {showToolTip && toolTipId && toolTipText && (
          <Tooltip
            containerClassName="account-settings-tooltip"
            id={toolTipId}
            placement="bottom"
            content={toolTipText}
          >
            <span className="icon-moreinfo" />
          </Tooltip>
        )}
      </label>
      <div className="stacked-user-input-children" id={inputId}>
        {children}
      </div>
    </div>
  );
};

StackedUserInput.defaultProps = {
  label: "",
  toolTipId: "",
  toolTipText: "",
  showToolTip: false,
};

export default StackedUserInput;
