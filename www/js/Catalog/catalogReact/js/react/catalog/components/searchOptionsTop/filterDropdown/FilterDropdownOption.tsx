/* eslint-disable react/require-default-props */
import React, { useEffect } from 'react';
import classNames from 'classnames';
import { TranslateFunction } from 'react-utilities';
import { TextField } from '@mui/material';
import { TFilterOption, TSecondaryFilterProps } from './CatalogFilter';
import { FilterOptionTextInputsMap } from './CatalogFilterDropdown.types';

type TFilterDropdownOptionProps<TOptionId extends number | string> = {
  option: TFilterOption<TOptionId>;
  isSelected: boolean;
  selectedOptionId: TOptionId;
  setSelectedOptionId: (optionId: TOptionId) => void;

  // Props to support text fields
  handleApplyClick?: () => void;
  textValues?: FilterOptionTextInputsMap | undefined;
  updateTextValue?: ((textInputKey: string, newValue: string) => void) | undefined;

  isSubOption?: boolean;

  secondaryFilterProps?: TSecondaryFilterProps<TOptionId>;
  selectedSecondaryOptionId?: TOptionId | undefined;
  setSelectedSecondaryOptionId?: (optionId: TOptionId) => void;

  translate: TranslateFunction;
};

const SELECT_ON_BLUR = false;

const FilterDropdownOption = <TOptionId extends number | string>({
  option,
  isSelected,
  selectedOptionId,
  setSelectedOptionId,
  textValues,
  updateTextValue,
  handleApplyClick,
  isSubOption,
  secondaryFilterProps,
  selectedSecondaryOptionId,
  setSelectedSecondaryOptionId,
  translate
}: TFilterDropdownOptionProps<TOptionId>): JSX.Element => {
  const { optionId, optionDisplayName, textFields, subOptions, showSecondaryFilters } = option;

  const [isSubOptionSelected, setIsSubOptionSelected] = React.useState(false);

  useEffect(() => {
    const matchingSubOption = option.subOptions?.find(
      subOption => subOption.optionId === selectedOptionId
    );
    setIsSubOptionSelected(!!matchingSubOption);
  }, [option.subOptions, selectedOptionId]);

  return (
    <React.Fragment>
      <button
        type='button'
        onClick={() => {
          setSelectedOptionId(optionId);
        }}
        className={classNames('filter-option', {
          'selected-option': isSelected,
          'sub-option': isSubOption
        })}
        aria-label={
          isSelected
            ? translate('Action.DropdownSelected', {
                optionName: optionDisplayName
              })
            : translate('Action.DropdownNotSelected', {
                optionName: optionDisplayName
              })
        }>
        <div>
          {optionDisplayName && <span className='filter-option-name'>{optionDisplayName}</span>}
          {textFields?.length && (
            <div style={{ display: 'flex', flexDirection: 'row', gap: '8px' }}>
              {textFields?.map(textField => {
                let value = textValues?.[textField.key];
                if (!value && value !== 0) {
                  value = '';
                }
                return (
                  <TextField
                    key={textField.key}
                    label={textField.label}
                    variant='outlined'
                    size='small'
                    fullWidth
                    value={value}
                    onChange={e => {
                      const newValue = e.target.value;
                      updateTextValue?.(textField.key, newValue);
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        setSelectedOptionId(optionId);
                        handleApplyClick?.();
                      }
                    }}
                    onBlur={() => {
                      if (SELECT_ON_BLUR) {
                        setSelectedOptionId(optionId);
                      }
                    }}
                  />
                );
              })}
            </div>
          )}
        </div>

        {isSelected ? (
          <span className='icon-radio-check-circle-filled' />
        ) : (
          <span className='icon-radio-check-circle' />
        )}
      </button>
      {(isSelected || isSubOptionSelected) &&
        subOptions?.map(subOption => {
          return (
            <FilterDropdownOption<TOptionId>
              key={subOption.optionId.toString()}
              option={subOption}
              isSelected={selectedOptionId === subOption.optionId}
              selectedOptionId={selectedOptionId}
              setSelectedOptionId={setSelectedOptionId}
              translate={translate}
              isSubOption
            />
          );
        })}
      {showSecondaryFilters &&
        isSelected &&
        selectedSecondaryOptionId &&
        setSelectedSecondaryOptionId &&
        secondaryFilterProps?.secondaryFilterOptions.map(secondaryOption => {
          return (
            <FilterDropdownOption<TOptionId>
              key={`$optionId}-${secondaryOption.optionId.toString()}`}
              option={secondaryOption}
              isSelected={selectedSecondaryOptionId === secondaryOption.optionId}
              selectedOptionId={selectedSecondaryOptionId}
              setSelectedOptionId={setSelectedSecondaryOptionId}
              translate={translate}
              isSubOption
            />
          );
        })}
    </React.Fragment>
  );
};

export default FilterDropdownOption;
