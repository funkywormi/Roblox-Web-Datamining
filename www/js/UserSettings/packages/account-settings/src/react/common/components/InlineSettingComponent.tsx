import React from "react";
import InlineUserInput from "./InlineUserInput";

/* 
  A component with an inline setting, title and description

  Pass translated text to this component
*/
export const InlineSettingComponent = ({
  label,
  inputId,
  description,
  children,
  id,
}: {
  label: string;
  inputId?: string;
  description?: JSX.Element;
  children?: JSX.Element;
  id?: string;
}): JSX.Element => {
  return (
    <div id={id} className="inline-setting-component section-content">
      <InlineUserInput label={label} inputId={inputId}>
        <div id={inputId}>{children}</div>
      </InlineUserInput>
      <div className="small text">{description}</div>
    </div>
  );
};

InlineSettingComponent.defaultProps = {
  inputId: undefined,
  description: undefined,
  children: undefined,
  id: undefined,
};

export default InlineSettingComponent;
