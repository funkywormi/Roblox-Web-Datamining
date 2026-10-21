import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type React from "react";
import { Button, Popover, PopoverAnchor, PopoverContent } from "@rbx/foundation-ui";
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
  const anchorRef = useRef<HTMLDivElement>(null);
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

  const handleOpenChange = useCallback(
    (nextIsOpen: boolean) => {
      if (!nextIsOpen) {
        if (isMenuOpen) {
          closeMenu();
        }
        return;
      }

      onFilterClick?.(filterGroup, "OpenDropdown", effectiveSelectedOptionId, undefined, isActive);
      setDraftOptionId(effectiveSelectedOptionId);
      setIsMenuOpen(true);
    },
    [closeMenu, effectiveSelectedOptionId, filterGroup, isActive, isMenuOpen, onFilterClick],
  );

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

  const preventAnchorDismissal = useCallback((event: CustomEvent<{ originalEvent: Event }>) => {
    const { target } = event.detail.originalEvent;
    if (target instanceof Node && anchorRef.current?.contains(target)) {
      event.preventDefault();
    }
  }, []);

  return (
    <Popover open={isMenuOpen} onOpenChange={handleOpenChange}>
      <PopoverAnchor asChild>
        <div ref={anchorRef}>
          <Button
            onClick={() => handleOpenChange(!isMenuOpen)}
            variant={isActive || isMenuOpen ? "Emphasis" : "Standard"}
            size="Medium"
            className={
              isActive || isMenuOpen
                ? "filter-select sdui-filter-select sdui-filter-select-active"
                : "filter-select sdui-filter-select"
            }
            aria-expanded={isMenuOpen}
            aria-haspopup="dialog"
          >
            <span className="filter-display-text">{selectedOption?.displayName}</span>
            <span
              className={
                isActive || isMenuOpen ? "icon-expand-arrow-selected" : "icon-expand-arrow"
              }
            />
          </Button>
        </div>
      </PopoverAnchor>
      <PopoverContent
        side="bottom"
        align="start"
        sideOffset={8}
        collisionPadding={10}
        ariaLabel={filterGroup.displayName}
        className="filters-container sdui-filter-menu-popover"
        // Foundation forwards these Radix dismissal props but does not expose them in its type.
        {...({
          onPointerDownOutside: preventAnchorDismissal,
          onInteractOutside: preventAnchorDismissal,
        } as Record<string, unknown>)}
      >
        <div className="filter-items-container">
          <FilterMenu
            filterGroup={filterGroup}
            selectedOptionId={draftOptionId}
            committedOptionId={effectiveSelectedOptionId}
            onOptionSelected={setDraftOptionId}
            onApply={applySelection}
            onClose={closeMenu}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default FilterPill;
