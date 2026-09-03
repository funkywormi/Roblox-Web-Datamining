import React, { ReactElement } from "react";

export const InlineUserInput = ({
  label,
  children,
  inputId,
}: {
  label: string;
  children: HTMLDivElement | ReactElement;
  inputId?: string;
}): React.JSX.Element => {
  return (
    <div className="inline-user-input">
      <div className="label font-body">{label}</div>
      <div id={inputId}>{children}</div>
    </div>
  );
};

InlineUserInput.defaultProps = {
  inputId: "",
};

export default InlineUserInput;
