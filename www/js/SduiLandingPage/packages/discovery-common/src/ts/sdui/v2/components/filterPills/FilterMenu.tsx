import React, { useCallback, useEffect } from "react";
import classNames from "classnames";
import { Button } from "@rbx/core-ui";
import { Badge } from "@rbx/foundation-ui";
import type { FilterPillsInputDataFilterGroup } from "@rbx/sdui-core";
import { useSduiServices } from "@rbx/sdui-core/client";
import {
  CommonUIFeatures,
  FeatureGamePage,
} from "../../../../common/constants/translationConstants";

type FilterMenuProps = {
  filterGroup: FilterPillsInputDataFilterGroup;
  selectedOptionId: string;
  committedOptionId: string;
  containerRef: React.RefObject<HTMLDivElement>;
  onOptionSelected: (optionId: string) => void;
  onApply: () => void;
  onClose: () => void;
};

const ESCAPE_KEY = "Escape";

export function FilterMenu({
  filterGroup,
  selectedOptionId,
  committedOptionId,
  containerRef,
  onOptionSelected,
  onApply,
  onClose,
}: FilterMenuProps): React.JSX.Element {
  const { translate } = useSduiServices();

  const handleMouseDown = useCallback(
    (event: MouseEvent) => {
      if (
        containerRef.current &&
        event.target instanceof Node &&
        !containerRef.current.contains(event.target)
      ) {
        onClose();
      }
    },
    [containerRef, onClose],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === ESCAPE_KEY) {
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleMouseDown, handleKeyDown]);

  const closeLabel = translate?.(CommonUIFeatures.ActionClose) ?? "Close";
  const applyLabel = translate?.(FeatureGamePage.ActionApply) ?? "Apply";

  return (
    <div className="filters-modal-container" role="dialog" aria-label={filterGroup.displayName}>
      <div className="header-container">
        <h3>{filterGroup.displayName}</h3>
        <div>
          <button
            type="button"
            className="header-close-button"
            onClick={onClose}
            aria-label={closeLabel}
          >
            <span className="icon-close" />
          </button>
        </div>
      </div>
      <div className="filter-options-container">
        {filterGroup.options.map((option, index) => {
          const isSelected = selectedOptionId === option.optionId;
          const optionAriaLabel = isSelected
            ? translate?.(CommonUIFeatures.ActionDropdownSelected, {
                optionName: option.displayName,
              })
            : translate?.(CommonUIFeatures.ActionDropdownNotSelected, {
                optionName: option.displayName,
              });

          return (
            <React.Fragment key={option.optionId}>
              <button
                type="button"
                onClick={() => onOptionSelected(option.optionId)}
                className={classNames("filter-option", {
                  "selected-option": isSelected,
                })}
                aria-checked={isSelected}
                role="menuitemradio"
                aria-label={optionAriaLabel}
              >
                <span className="filter-option-name">{option.displayName}</span>
                <span className="flex gap-small">
                  {option.optionContextTag ? (
                    <Badge
                      label={option.optionContextTag}
                      className="max-width-2900 overflow-hidden"
                    />
                  ) : null}
                  <span
                    className={
                      isSelected ? "icon-radio-check-circle-filled" : "icon-radio-check-circle"
                    }
                  />
                </span>
              </button>
              {index === 0 ? <div className="filter-option-divider" /> : null}
            </React.Fragment>
          );
        })}
      </div>
      <div className="action-buttons-container">
        <Button
          onClick={onApply}
          variant={Button.variants.primary}
          size={Button.sizes.medium}
          width={Button.widths.full}
          className="apply-button"
          isDisabled={selectedOptionId === committedOptionId}
        >
          {applyLabel}
        </Button>
      </div>
    </div>
  );
}

export default FilterMenu;
