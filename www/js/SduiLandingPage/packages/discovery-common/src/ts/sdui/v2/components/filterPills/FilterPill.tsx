import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type React from "react";
import { Button } from "@rbx/core-ui";
import type { FilterPillsInputDataFilterGroup } from "@rbx/sdui-core";
import FilterMenu from "./FilterMenu";

export type FilterClickButtonName = "OpenDropdown" | "CloseDropdown" | "Apply";

type FilterPillProps = {
  filterGroup: FilterPillsInputDataFilterGroup;
  effectiveSelectedOptionId: string;
  isActive: boolean;
  onFilterClick?: (
    filterGroup: FilterPillsInputDataFilterGroup,
    buttonName: FilterClickButtonName,
    nextOptionId: string,
    previousOptionId?: string,
    isActive?: boolean,
  ) => void;
  onApplyFilter: (filterGroup: FilterPillsInputDataFilterGroup, selectedOptionId: string) => void;
};

function getSelectedOption(filterGroup: FilterPillsInputDataFilterGroup, selectedOptionId: string) {
  return (
    filterGroup.options.find(option => option.optionId === selectedOptionId) ??
    filterGroup.options.find(option => option.optionId === filterGroup.defaultOptionId) ??
    filterGroup.options[0]
  );
}

export function FilterPill({
  filterGroup,
  effectiveSelectedOptionId,
  isActive,
  onFilterClick,
  onApplyFilter,
}: FilterPillProps): React.JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [draftOptionId, setDraftOptionId] = useState(effectiveSelectedOptionId);

  const selectedOption = useMemo(
    () => getSelectedOption(filterGroup, effectiveSelectedOptionId),
    [filterGroup, effectiveSelectedOptionId],
  );

  useEffect(() => {
    if (!isMenuOpen) {
      setDraftOptionId(effectiveSelectedOptionId);
    }
  }, [effectiveSelectedOptionId, isMenuOpen]);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
    setDraftOptionId(effectiveSelectedOptionId);
    onFilterClick?.(
      filterGroup,
      "CloseDropdown",
      effectiveSelectedOptionId,
      draftOptionId,
      isActive,
    );
  }, [draftOptionId, effectiveSelectedOptionId, filterGroup, isActive, onFilterClick]);

  const toggleMenu = useCallback(() => {
    if (isMenuOpen) {
      closeMenu();
      return;
    }

    onFilterClick?.(filterGroup, "OpenDropdown", effectiveSelectedOptionId, undefined, isActive);
    setDraftOptionId(effectiveSelectedOptionId);
    setIsMenuOpen(true);
  }, [closeMenu, effectiveSelectedOptionId, filterGroup, isActive, isMenuOpen, onFilterClick]);

  const applySelection = useCallback(() => {
    onFilterClick?.(filterGroup, "Apply", draftOptionId, effectiveSelectedOptionId, isActive);
    onApplyFilter(filterGroup, draftOptionId);
    setIsMenuOpen(false);
  }, [
    draftOptionId,
    effectiveSelectedOptionId,
    filterGroup,
    isActive,
    onApplyFilter,
    onFilterClick,
  ]);

  return (
    <div ref={containerRef}>
      <Button
        onClick={toggleMenu}
        variant={isActive || isMenuOpen ? Button.variants.primary : Button.variants.secondary}
        size={Button.sizes.medium}
        className="filter-select"
        aria-expanded={isMenuOpen}
      >
        <span className="filter-display-text">{selectedOption?.displayName}</span>
        <span
          className={isActive || isMenuOpen ? "icon-expand-arrow-selected" : "icon-expand-arrow"}
        />
      </Button>
      {isMenuOpen ? (
        <FilterMenu
          filterGroup={filterGroup}
          selectedOptionId={draftOptionId}
          committedOptionId={effectiveSelectedOptionId}
          containerRef={containerRef}
          onOptionSelected={setDraftOptionId}
          onApply={applySelection}
          onClose={closeMenu}
        />
      ) : null}
    </div>
  );
}

export default FilterPill;
