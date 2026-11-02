import type { JSX } from "react";
import { Chip, TChipProps } from "@rbx/foundation-ui";
import { useTranslation } from "@rbx/core-scripts/react";
import { Gender } from "../types/signupTypes";

export type GenderChipsProps = {
  /** The currently selected gender; `unknown` means none is selected. */
  gender: Gender;
  isDisabled?: boolean;
  /** Chip size; SignUpV2 uses `Medium`, the birthday compliance form `Large`. */
  size?: TChipProps["size"];
  /** Classes for the group label span. */
  labelClassName?: string;
  /** Overrides the group label; defaults to the "Gender" translation. */
  label?: string;
  /** DOM id of the group label span. */
  labelId?: string;
  onChange: (gender: Gender) => void;
};

// Female first, with Foundation's head icons, as in SignUpV2 and the birthday compliance form.
// The revamp signup form uses temporary custom icons and Male first, so it keeps its own
// GenderInput until the Foundation icon overhaul converges the designs.
const GenderChips = ({
  gender,
  isDisabled,
  size = "Medium",
  labelClassName = "text-title-medium content-default",
  label,
  labelId = "gender-chips-label",
  onChange,
}: GenderChipsProps): JSX.Element => {
  const { translate } = useTranslation();
  const handleCheckedChange = (isChecked: boolean, nextGender: Gender): void => {
    // Clicking the selected chip again clears the selection.
    onChange(isChecked ? nextGender : Gender.unknown);
  };

  return (
    <div role="group" aria-labelledby={labelId} className="flex flex-col gap-small">
      <span id={labelId} className={labelClassName}>
        {label ?? translate("Label.Gender")}
      </span>
      <div className="flex gap-small">
        <Chip
          text={translate("Label.Female")}
          size={size}
          variant="Standard"
          leadingIconName="icon-regular-head-female"
          isChecked={gender === Gender.female}
          isDisabled={isDisabled}
          onCheckedChange={isChecked => {
            handleCheckedChange(isChecked, Gender.female);
          }}
        />
        <Chip
          text={translate("Label.Male")}
          size={size}
          variant="Standard"
          leadingIconName="icon-regular-head-male"
          isChecked={gender === Gender.male}
          isDisabled={isDisabled}
          onCheckedChange={isChecked => {
            handleCheckedChange(isChecked, Gender.male);
          }}
        />
      </div>
    </div>
  );
};

export default GenderChips;
