import React from "react";
import classNames from "classnames";
import { TranslateFunction } from "@rbx/core-scripts/react";
import { Badge } from "@rbx/foundation-ui";
import { TFilterOption } from "../../common/types/bedev2Types";
import { CommonUIFeatures } from "../../common/constants/translationConstants";

type TFilterDropdownOptionProps = {
  option: TFilterOption;
  isSelected: boolean;
  setSelectedOptionId: (optionId: string) => void;
  translate: TranslateFunction;
};

const FilterDropdownOption = ({
  option,
  isSelected,
  setSelectedOptionId,
  translate,
}: TFilterDropdownOptionProps): JSX.Element => {
  return (
    <button
      type="button"
      onClick={() => setSelectedOptionId(option.optionId)}
      className={classNames("filter-option", {
        "selected-option": isSelected,
      })}
      aria-label={
        isSelected
          ? translate(CommonUIFeatures.ActionDropdownSelected, {
              optionName: option.optionDisplayName,
            })
          : translate(CommonUIFeatures.ActionDropdownNotSelected, {
              optionName: option.optionDisplayName,
            })
      }
    >
      <span className="filter-option-name">{option.optionDisplayName}</span>
      <span className="flex gap-small">
        {option.optionContextTag && (
          <Badge label={option.optionContextTag} className="max-width-2900 overflow-hidden" />
        )}
        {isSelected ? (
          <span className="icon-radio-check-circle-filled" />
        ) : (
          <span className="icon-radio-check-circle" />
        )}
      </span>
    </button>
  );
};

export default FilterDropdownOption;
