/* eslint-disable react/require-default-props */
import React, { useCallback, useEffect, useState } from 'react';
import { Button } from 'react-style-guide';
import { TranslateFunction } from 'react-utilities';
import classNames from 'classnames';
import { TFilterOption, TFiltersData } from './CatalogFilter';
import FilterDropdownOption from './FilterDropdownOption';
import { FilterOptionTextInputsMap } from './CatalogFilterDropdown.types';

type CatalogFilterDropdownProps<TOptionId extends number | string> = {
  filter: TFiltersData<TOptionId>;
  dropdownContainerRef: React.RefObject<HTMLDivElement>;
  selectedOptionId: TOptionId;
  setSelectedOptionId: (optionId: TOptionId) => void;
  setIsDropdownOpen: (isOpen: boolean) => void;
  updateFilterValue: (
    newOptionValue: TFilterOption<TOptionId> | undefined,
    textValues: FilterOptionTextInputsMap | undefined,
    newSecondaryOptionValue: TFilterOption<TOptionId> | undefined
  ) => void;
  selectedSecondaryOptionId?: TOptionId;
  setSecondarySelectedOptionId?: (optionId: TOptionId) => void;
  showDivider?: boolean;
  fixedWidth?: boolean;
  translate: TranslateFunction;
};

/**
 * Custom dropdown component for selecting from a list of filter options.
 * The options each have a circle icon that displays the selected state.
 */
const CatalogFilterDropdown = <TOptionId extends number | string>({
  filter,
  dropdownContainerRef,
  selectedOptionId,
  selectedSecondaryOptionId,
  setSecondarySelectedOptionId,
  setSelectedOptionId,
  setIsDropdownOpen,
  updateFilterValue,
  showDivider,
  fixedWidth,
  translate
}: CatalogFilterDropdownProps<TOptionId>): JSX.Element => {
  const [textInputs, setTextInputs] = useState<Record<TOptionId, FilterOptionTextInputsMap>>(
    {} as Record<TOptionId, FilterOptionTextInputsMap>
  );

  useEffect(() => {
    const initialTextInputs = {} as Record<TOptionId, FilterOptionTextInputsMap>;
    filter.filterOptions
      .filter(option => option.textFields)
      .forEach(option => {
        option.textFields?.forEach(textField => {
          const textInputsMap = (initialTextInputs[option.optionId] ||
            {}) as FilterOptionTextInputsMap;
          textInputsMap[textField.key] = textField.initialValue;
          initialTextInputs[option.optionId] = textInputsMap;
        });
      });

    setTextInputs(initialTextInputs);
  }, [filter.filterOptions]);

  const updateTextValue = useCallback(
    (optionId: TOptionId, textInputKey: string, newValue: string) => {
      setTextInputs(prevTextInputs => {
        return {
          ...prevTextInputs,
          [optionId]: {
            ...prevTextInputs[optionId],
            [textInputKey]: newValue
          }
        };
      });
    },
    []
  );

  const handleApplyClick = useCallback(() => {
    let selectedOption: TFilterOption<TOptionId> | undefined;

    // eslint-disable-next-line no-restricted-syntax
    for (const option of filter.filterOptions) {
      if (option.optionId === selectedOptionId) {
        selectedOption = option;
        break;
      }
      if (option.subOptions) {
        // eslint-disable-next-line no-restricted-syntax
        for (const subOption of option.subOptions) {
          if (subOption.optionId === selectedOptionId) {
            selectedOption = subOption;
            break;
          }
        }
      }
    }

    const selectedOptionTextValue = textInputs[selectedOptionId];

    const selectedSecondaryOption = filter.secondaryFilterProps?.secondaryFilterOptions?.find(
      option => option.optionId === selectedSecondaryOptionId
    );

    updateFilterValue(selectedOption, selectedOptionTextValue, selectedSecondaryOption);
    setIsDropdownOpen(false);
  }, [
    textInputs,
    selectedOptionId,
    filter.secondaryFilterProps?.secondaryFilterOptions,
    filter.filterOptions,
    updateFilterValue,
    setIsDropdownOpen,
    selectedSecondaryOptionId
  ]);

  const hasTextInputChanged = useCallback(
    (optionId: TOptionId): boolean => {
      const filterOption = filter.filterOptions.find(option => option.optionId === optionId);
      if (!filterOption?.textFields) {
        return false;
      }
      return filterOption.textFields.some(textField => {
        return textField.initialValue !== textInputs[optionId]?.[textField.key];
      });
    },
    [filter.filterOptions, textInputs]
  );

  const closeAndResetDropdown = useCallback(() => {
    setIsDropdownOpen(false);
  }, [setIsDropdownOpen]);

  const handleMouseClick = useCallback(
    (e: MouseEvent) => {
      if (
        dropdownContainerRef.current &&
        e.target instanceof Node &&
        !dropdownContainerRef.current.contains(e.target)
      ) {
        closeAndResetDropdown();
      }
    },
    [closeAndResetDropdown, dropdownContainerRef]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeAndResetDropdown();
      }
    },
    [closeAndResetDropdown]
  );

  useEffect(() => {
    document.addEventListener('mousedown', handleMouseClick);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleMouseClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleMouseClick, handleKeyDown]);

  return (
    <div
      className={classNames('filters-modal-container', {
        'fixed-width': fixedWidth
      })}>
      <div className='header-container'>
        <h3>{filter.filterDropdownName}</h3>
        <div>
          <button type='button' className='header-close-button' onClick={closeAndResetDropdown}>
            <span className='icon-close' />
          </button>
        </div>
      </div>
      <div className='filter-options-container'>
        {filter.filterOptions.map((option, index) => (
          <React.Fragment key={option.optionId.toString()}>
            <FilterDropdownOption<TOptionId>
              option={option}
              isSelected={selectedOptionId === option.optionId}
              selectedOptionId={selectedOptionId}
              selectedSecondaryOptionId={selectedSecondaryOptionId}
              setSelectedOptionId={setSelectedOptionId}
              setSelectedSecondaryOptionId={setSecondarySelectedOptionId}
              textValues={textInputs[option.optionId] as FilterOptionTextInputsMap | undefined}
              handleApplyClick={handleApplyClick}
              updateTextValue={(textInputKey: string, newValue: string) => {
                updateTextValue(option.optionId, textInputKey, newValue);
              }}
              translate={translate}
              secondaryFilterProps={filter.secondaryFilterProps}
            />
            {showDivider && index === 0 && <div className='filter-option-divider' />}
          </React.Fragment>
        ))}
      </div>
      <div className='action-buttons-container'>
        <Button
          onClick={handleApplyClick}
          variant={Button.variants.primary}
          size={Button.sizes.medium}
          width={Button.widths.full}
          className='apply-button'
          isDisabled={
            selectedOptionId === filter.selectedOptionId &&
            !hasTextInputChanged(filter.selectedOptionId) &&
            selectedSecondaryOptionId === filter.secondaryFilterProps?.selectedSecondaryOptionId
          }>
          {translate('Action.Filter.Apply')}
        </Button>
      </div>
    </div>
  );
};

export default CatalogFilterDropdown;
