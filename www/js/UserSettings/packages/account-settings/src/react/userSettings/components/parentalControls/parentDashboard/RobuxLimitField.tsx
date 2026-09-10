import React from "react";
import { useTranslation } from "react-utilities";
import { formatNumber } from "@rbx/core-scripts/format/number";
import { Icon } from "@rbx/foundation-ui";
import { isRobuxTransferLimitOutOfRange } from "@rbx/user-settings";
import parentalControlsTranslationConstants from "../../../constants/contentConstants/parentalControlsTranslationConstants";

/** Empty means the parent is setting no cap, which is distinct from a cap of zero. */
const toCap = (raw: string): number | null => (raw === "" ? null : Number(raw));

const RobuxLimitField = ({
  inputId,
  labelKey,
  maxLabelKey,
  cap,
  tierCap,
  placeholder,
  onChange,
}: {
  inputId: string;
  labelKey: string;
  maxLabelKey: string;
  cap: number | null;
  tierCap: number;
  placeholder: string;
  onChange: (next: number | null) => void;
}): JSX.Element => {
  const { translate } = useTranslation();
  const { robuxTransferLimits } = parentalControlsTranslationConstants;
  // Both the maximum and the range error name the ceiling, and both own the
  // wording around it, so the number is formatted here and injected whole.
  const maxTransferLimit = formatNumber(tierCap);

  return (
    <div className="flex flex-col">
      <label htmlFor={inputId}>{translate(labelKey)}</label>
      <div className="form-group input-box relative">
        {/* The icon overlays the input rather than sitting beside it, so the field keeps
            the height and border of every other settings input. */}
        <span className="absolute top-[0] left-[15px] height-full flex items-center pointer-events-none">
          <Icon name="icon-filled-robux" size="Small" />
        </span>
        <input
          id={inputId}
          className="form-control input-field input-number input-box padding-left-[40px]"
          type="number"
          value={cap ?? ""}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(toCap(e.target.value))}
          placeholder={placeholder}
        />
      </div>
      {isRobuxTransferLimitOutOfRange(cap, tierCap) ? (
        <div className="text-error">
          {translate(robuxTransferLimits.exceedRangeError, { maxTransferLimit })}
        </div>
      ) : (
        <div className="text-footer">{translate(maxLabelKey, { maxTransferLimit })}</div>
      )}
    </div>
  );
};

export default RobuxLimitField;
