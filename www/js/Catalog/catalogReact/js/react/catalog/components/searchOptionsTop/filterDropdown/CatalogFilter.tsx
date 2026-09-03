/* eslint-disable react/require-default-props */
import React, { useEffect, useState, useCallback } from 'react';
import { Button } from 'react-style-guide';
import { WithTranslationsProps } from 'react-utilities';
import CloseIcon from '@mui/icons-material/Close';
import { IconButton } from '@mui/material';
import classNames from 'classnames';
import CatalogFilterDropdown from './CatalogFilterDropdown';
import { FilterOptionTextInputsMap } from './CatalogFilterDropdown.types';

export type TFilterOptionTextInput = {
  label: string;
  initialValue: string | number;
  key: string;
};

export type TFilterOption<TOptionId extends number | string> = {
  optionId: TOptionId;
  optionDisplayName: string;
  optionValue: any;
  textFields?: TFilterOptionTextInput[];
  subOptions?: TFilterOption<TOptionId>[];
  showSecondaryFilters?: boolean;
};

export type TSecondaryFilterProps<TOptionId extends number | string> = {
  secondaryFilterOptions: TFilterOption<TOptionId>[];
  selectedSecondaryOptionId: TOptionId;
  defaultSecondaryOption: TOptionId;
};

export type TFiltersData<TOptionId extends number | string> = {
  filterDropdownName: string;
  filterDisplayName: string;
  renderPillContents?: () => JSX.Element;
  filterOptions: TFilterOption<TOptionId>[];
  selectedOptionId: TOptionId;
  defaultOptionId: TOptionId;
  secondaryFilterProps?: TSecondaryFilterProps<TOptionId>;
};

type TCatalogFilterProps<TOptionId extends number | string> = {
  filter: TFiltersData<TOptionId>;
  updateFilterValue: (
    newOptionValue: TFilterOption<TOptionId> | undefined,
    textValues: FilterOptionTextInputsMap | undefined,
    newSecondaryOptionValue: TFilterOption<TOptionId> | undefined
  ) => void;
  fixedWidth?: boolean;
  showDivider?: boolean;
};

const CatalogFilter = <TOptionId extends number | string>({
  filter,
  updateFilterValue,
  fixedWidth,
  showDivider,
  translate
}: TCatalogFilterProps<TOptionId> & WithTranslationsProps): JSX.Element => {
  const dropdownContainerRef = React.useRef<HTMLDivElement>(null);

  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  const [selectedOptionId, setSelectedOptionId] = useState<TOptionId>(filter.selectedOptionId);
  const isDefaultOptionSelected = filter.selectedOptionId === filter.defaultOptionId;

  const [selectedSecondaryOptionId, setSelectedSecondaryOptionId] = useState<TOptionId | undefined>(
    filter.secondaryFilterProps?.selectedSecondaryOptionId
  );

  useEffect(() => {
    if (isDropdownOpen) {
      setSelectedOptionId(filter.selectedOptionId);
      setSelectedSecondaryOptionId(filter.secondaryFilterProps?.selectedSecondaryOptionId);
    }
  }, [
    isDropdownOpen,
    filter.selectedOptionId,
    filter.secondaryFilterProps?.selectedSecondaryOptionId
  ]);

  const handleDropdownEntryClick = () => {
    setIsDropdownOpen(prevIsDropdownOpen => !prevIsDropdownOpen);
  };

  const resetFilterToDefault: React.MouseEventHandler<HTMLButtonElement> = useCallback(
    (event: React.MouseEvent) => {
      const defaultOption = filter.filterOptions.find(
        option => option.optionId === filter.defaultOptionId
      );

      const defaultSecondaryOption = filter.secondaryFilterProps?.secondaryFilterOptions.find(
        option => option.optionId === filter.secondaryFilterProps?.defaultSecondaryOption
      );

      updateFilterValue(defaultOption, undefined, defaultSecondaryOption);
      setIsDropdownOpen(false);
      event.stopPropagation();
    },
    [
      filter.filterOptions,
      filter.secondaryFilterProps?.secondaryFilterOptions,
      filter.secondaryFilterProps?.defaultSecondaryOption,
      filter.defaultOptionId,
      updateFilterValue
    ]
  );

  let filterEndIcon = 'icon-expand-arrow';
  if (isDropdownOpen) {
    filterEndIcon = 'icon-expand-arrow-selected';
  } else {
    filterEndIcon = isDefaultOptionSelected ? 'icon-expand-arrow' : 'icon-close';
  }

  return (
    <div ref={dropdownContainerRef}>
      <Button
        onClick={() => handleDropdownEntryClick()}
        variant={
          isDropdownOpen || !isDefaultOptionSelected
            ? Button.variants.primary
            : Button.variants.secondary
        }
        size={Button.sizes.medium}
        className={classNames('filter-select', { selected: !isDefaultOptionSelected })}>
        {filter.renderPillContents ? (
          filter.renderPillContents()
        ) : (
          <span className='filter-display-text'>{filter.filterDisplayName}</span>
        )}
        {!isDefaultOptionSelected && !isDropdownOpen ? (
          <IconButton
            onClick={resetFilterToDefault}
            className='catalog-filter-dropdown-clear-button'
            size='small'>
            <CloseIcon sx={{ fontSize: 16 }} />
          </IconButton>
        ) : (
          <span className={filterEndIcon} />
        )}
      </Button>
      {isDropdownOpen && (
        <CatalogFilterDropdown<TOptionId>
          filter={filter}
          dropdownContainerRef={dropdownContainerRef}
          selectedOptionId={selectedOptionId}
          selectedSecondaryOptionId={selectedSecondaryOptionId}
          setSelectedOptionId={setSelectedOptionId}
          setSecondarySelectedOptionId={setSelectedSecondaryOptionId}
          setIsDropdownOpen={setIsDropdownOpen}
          updateFilterValue={updateFilterValue}
          fixedWidth={fixedWidth}
          translate={translate}
          showDivider={showDivider}
        />
      )}
    </div>
  );
};

export default CatalogFilter;
