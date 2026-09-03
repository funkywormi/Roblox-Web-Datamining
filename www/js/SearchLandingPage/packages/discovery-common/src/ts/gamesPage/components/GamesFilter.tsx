import React, { useCallback, useMemo, useState } from "react";
import { Button } from "@rbx/core-ui";
import { TranslateFunction } from "@rbx/core-scripts/react";
import { TFiltersData } from "../../common/types/bedev2Types";
import GamesFilterDropdown from "./GamesFilterDropdown";
import { TGamesFilterButton } from "../../common/constants/eventStreamConstants";
import { TSendFilterClickEvent } from "../../omniFeed/hooks/useGameFiltersAnalytics";
import getOptionContextTag from "../../omniFeed/utils/getOptionContextTag";

type TGamesFilterProps = {
  filter: TFiltersData;
  updateFilterValue: (newValue: string) => void;
  sendFilterClickEvent: TSendFilterClickEvent;
  translate: TranslateFunction;
};

const GamesFilter = ({
  filter,
  updateFilterValue,
  sendFilterClickEvent,
  translate,
}: TGamesFilterProps): JSX.Element => {
  const dropdownContainerRef = React.useRef<HTMLDivElement>(null);

  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  const [selectedOptionId, setSelectedOptionId] = useState<string>(filter.selectedOptionId);

  const filterDisplayText = useMemo(() => {
    const selectedOption = filter.filterOptions.find(
      option => option.optionId === filter.selectedOptionId,
    );

    return selectedOption?.optionDisplayName;
  }, [filter.selectedOptionId, filter.filterOptions]);

  // Set the button to active (primary) variant if the dropdown is open, or if the
  // currently selected option is not one of the default options (that do not filter)
  const isFilterActive = useMemo(() => {
    if (isDropdownOpen) {
      return true;
    }
    if (!filter.inactiveOptionIds) {
      return false;
    }
    return !filter.inactiveOptionIds.includes(selectedOptionId);
  }, [isDropdownOpen, filter.inactiveOptionIds, selectedOptionId]);

  const handleDropdownEntryClick = useCallback(() => {
    setIsDropdownOpen(prevIsDropdownOpen => {
      const clickType = prevIsDropdownOpen
        ? TGamesFilterButton.CloseDropdown
        : TGamesFilterButton.OpenDropdown;

      const previousOptionId = prevIsDropdownOpen ? selectedOptionId : undefined;

      sendFilterClickEvent(
        filter.filterId,
        clickType,
        filter.selectedOptionId,
        previousOptionId,
        isFilterActive,
        getOptionContextTag(filter.selectedOptionId, filter.filterOptions),
        getOptionContextTag(previousOptionId, filter.filterOptions),
      );

      return !prevIsDropdownOpen;
    });
  }, [
    isFilterActive,
    sendFilterClickEvent,
    selectedOptionId,
    filter.filterId,
    filter.selectedOptionId,
    filter.filterOptions,
  ]);

  return (
    <div ref={dropdownContainerRef}>
      <Button
        onClick={handleDropdownEntryClick}
        variant={isFilterActive ? Button.variants.primary : Button.variants.secondary}
        size={Button.sizes.medium}
        className="filter-select"
      >
        <span className="filter-display-text">{filterDisplayText}</span>
        <span className={isFilterActive ? "icon-expand-arrow-selected" : "icon-expand-arrow"} />
      </Button>
      {isDropdownOpen && (
        <GamesFilterDropdown
          filter={filter}
          dropdownContainerRef={dropdownContainerRef}
          selectedOptionId={selectedOptionId}
          setSelectedOptionId={setSelectedOptionId}
          setIsDropdownOpen={setIsDropdownOpen}
          updateFilterValue={updateFilterValue}
          sendFilterClickEvent={sendFilterClickEvent}
          translate={translate}
          isFilterActive={isFilterActive} // always true when dropdown is open
        />
      )}
    </div>
  );
};

export default GamesFilter;
