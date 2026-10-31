import type { JSX } from "react";
import { Checkbox } from "@rbx/foundation-ui";

export type MarketingConsentCheckboxProps = {
  /** The consent text, already translated. */
  text: string;
  isChecked: boolean;
  isDisabled: boolean;
  onToggle: () => void;
};

const MarketingConsentCheckbox = ({
  text,
  isChecked,
  isDisabled,
  onToggle,
}: MarketingConsentCheckboxProps): JSX.Element => (
  <Checkbox
    size="Small"
    placement="Start"
    label={text}
    isChecked={isChecked}
    isDisabled={isDisabled}
    onCheckedChange={() => {
      onToggle();
    }}
  />
);

export default MarketingConsentCheckbox;
