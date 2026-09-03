import React from "react";
import { useTranslation } from "react-utilities";
import ClassNames from "classnames";
import { Radio, RadioGroup } from "@rbx/foundation-ui";

export type TRadioButtonOption = {
  label: string;
  value: string;
  id: string;
  name?: string; // IMPORTANT: If multiple options share the same name on a page, only 1 will be selectable at a time
  disabled?: boolean | undefined;
};

export const RadioButtonOptions = ({
  options,
  className = "",
  selectedOption,
  title,
  description,
  onValueChange,
}: {
  options: TRadioButtonOption[];
  className?: string;
  selectedOption?: string;
  title?: string;
  description?: string;
  onValueChange: (value: any) => void;
}): JSX.Element => {
  const { translate } = useTranslation();

  const radioBtnContainerClassName = ClassNames(
    "radio-buttons-options-container font-header-2",
    className,
    "gap-y-xsmall",
  );
  const radioGroupClassName = ClassNames("margin-y-[5px]");

  const radioButtons = options.map(option => {
    return (
      <div key={option.id}>
        <Radio
          data-testid={option.id}
          value={option.value}
          isDisabled={option.disabled || false}
          checked={option.value === selectedOption}
          label={translate(option.label)}
        />
      </div>
    );
  });

  return (
    <div className={radioBtnContainerClassName} data-testid="radio-buttons-group">
      {title && <h4 className="radio-buttons-header">{title}</h4>}
      <RadioGroup
        className={radioGroupClassName}
        size="Medium"
        value={selectedOption}
        onValueChange={e => {
          onValueChange(e);
        }}
      >
        {radioButtons}
      </RadioGroup>
      {description && <div className="small text radio-button-description">{description}</div>}
    </div>
  );
};

RadioButtonOptions.defaultProps = {
  selectedOption: "",
  className: "",
  title: undefined,
  description: undefined,
};

export default RadioButtonOptions;
