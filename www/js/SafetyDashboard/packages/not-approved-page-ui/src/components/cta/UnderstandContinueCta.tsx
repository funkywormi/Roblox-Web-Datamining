import { Fragment, useState } from "react";
import { Checkbox, TCheckboxCheckState } from "@rbx/foundation-ui";
import { useNotApprovedTranslate } from "../../providers/NotApprovedUIProvider";
import ContinueButtonCta from "./ContinueButtonCta";

/**
 * Similar to the basic ContinueButtonCta but with the added addition of a "I understand" checkbox.
 * The user will need to check the checkbox before they can continue to the next page.
 */
const UnderstandContinueCta = () => {
  const translate = useNotApprovedTranslate();
  const [isChecked, setIsChecked] = useState(false);

  const onCheckboxChange = (checked: TCheckboxCheckState) => {
    setIsChecked(checked === true);
  };

  return (
    <Fragment>
      <Checkbox
        label={translate("Label.RuleAcknowledgment")}
        placement="Start"
        size="Small"
        isChecked={isChecked}
        onCheckedChange={onCheckboxChange}
        className="self-start"
        data-testid="understand-continue-checkbox"
      />
      <ContinueButtonCta isDisabled={!isChecked} />
    </Fragment>
  );
};

export default UnderstandContinueCta;
