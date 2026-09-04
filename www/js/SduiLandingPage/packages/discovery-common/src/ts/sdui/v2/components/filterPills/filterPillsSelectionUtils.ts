import type { FilterPillsInputDataFilterGroup } from "@rbx/sdui-core";

export type PendingApply = {
  filterType: string;
  optionId: string;
};

export type FilterSelections = Record<string, string>;

export function getEffectiveSelectedOptionId(
  filterGroup: FilterPillsInputDataFilterGroup,
  pendingApply: PendingApply | null,
): string {
  if (pendingApply?.filterType === filterGroup.filterType) {
    return pendingApply.optionId;
  }
  return filterGroup.selectedOptionId;
}

export function isActiveSelection(
  filterGroup: FilterPillsInputDataFilterGroup,
  optionId: string,
): boolean {
  return !filterGroup.inactiveOptionIds.includes(optionId);
}

export function buildFilterSelections(
  filterGroups: FilterPillsInputDataFilterGroup[],
  pendingApply: PendingApply | null,
): FilterSelections {
  const selections: FilterSelections = {};

  filterGroups.forEach(({ filterType, selectedOptionId }) => {
    if (selectedOptionId) {
      selections[filterType] = selectedOptionId;
    }
  });

  if (pendingApply?.optionId) {
    selections[pendingApply.filterType] = pendingApply.optionId;
  }

  return selections;
}
