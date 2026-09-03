import React, { useCallback } from 'react';
import './css/_filterSelector.scss';
import { Dropdown, Menu, MenuItem } from '@rbx/foundation-ui';
import { FilterOption } from './types';

interface FilterSelectorProps<T extends FilterOption> {
  options: T[];
  optionLeadingElement?: (option: T) => React.ReactNode;
  optionTrailingElement?: (option: T) => React.ReactNode;
  selectedOption: T | null;
  onOptionSelect: (option: T) => void;
  placeholder?: string;
}

const FilterSelector = <T extends FilterOption>({
  options,
  optionLeadingElement,
  optionTrailingElement,
  selectedOption,
  onOptionSelect,
  placeholder
}: FilterSelectorProps<T>): React.ReactElement | null => {
  const renderMenuItem = useCallback(
    (option: T) => (
      <MenuItem
        key={option.id.toString()}
        title={option.name}
        value={option.value}
        leading={optionLeadingElement ? optionLeadingElement(option) : undefined}
        trailing={optionTrailingElement ? optionTrailingElement(option) : undefined}
      />
    ),
    [optionLeadingElement, optionTrailingElement]
  );

  if (options.length === 0) {
    return null;
  }

  return (
    <div className="filter-selector-container">
      <Dropdown
        className="filter-selector-dropdown-popover"
        placeholder={selectedOption?.name || placeholder || ''}
        size="Medium"
        value={selectedOption?.value || ''}
        onValueChange={(value: string) => {
          const foundOption = options.find(option => option.value === value);
          if (foundOption) {
            onOptionSelect(foundOption);
          }
        }}
      >
        <Menu>{options.map(option => renderMenuItem(option))}</Menu>
      </Dropdown>
    </div>
  );
};

export default FilterSelector;
