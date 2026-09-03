import React, { useMemo } from 'react';
import { WithTranslationsProps, withTranslations } from 'react-utilities';
import { AXAnalyticsService } from 'Roblox';
import translationConfig from '../../translation.config';
import { SortAggregation, SortMenus, SortOption } from '../../constants/types';
import CatalogFilter, { TFilterOption } from './filterDropdown/CatalogFilter';

export type SortsDropdownProps = {
  sortMenus: SortMenus;
  selectedSortType?: SortOption;
  onSortTypeChanged: (sortType: SortOption['sortType']) => void;
  selectedSortAggregation?: SortAggregation;
  onSortAggregationChanged: (sortAggregation: SortAggregation['sortAggregation']) => void;
  defaultSortValue?: SortOption;
  defaultSortAggregationValue?: SortAggregation;
};

function SortsDropdown({
  sortMenus,
  selectedSortType,
  onSortTypeChanged,
  selectedSortAggregation,
  onSortAggregationChanged,
  defaultSortValue,
  defaultSortAggregationValue,
  translate,
  intl
}: SortsDropdownProps & WithTranslationsProps): JSX.Element | null {
  const filters: TFilterOption<number>[] = useMemo(() => {
    return (
      sortMenus.sortOptions.map(sortOption => {
        const filterOption: TFilterOption<number> = {
          optionId: sortOption.sortType,
          optionDisplayName: sortOption.name,
          optionValue: sortOption.sortType,
          showSecondaryFilters: sortOption.hasSubMenu
        };

        return filterOption;
      }) || []
    );
  }, [sortMenus]);

  const secondaryFilters: TFilterOption<number>[] = useMemo(() => {
    return (
      sortMenus.sortAggregations?.map(sortAggregation => {
        return {
          optionId: sortAggregation.sortAggregation,
          optionDisplayName: sortAggregation.name,
          optionValue: sortAggregation.sortAggregation
        };
      }) || []
    );
  }, [sortMenus]);

  if (!selectedSortType) {
    return null;
  }

  if (!defaultSortValue || !defaultSortAggregationValue) {
    const itemName = `SortsDropdown_NoDefault`;
    const log = JSON.stringify({
      message: `Unable to render SortsDropdown because ${
        !defaultSortValue ? 'defaultSortValue' : 'defaultSortAggregationValue'
      } was not found!`
    });
    // Report the error
    // We need to specify container name as counters name so we can build the graphs on grafana
    AXAnalyticsService.reportAXError({ itemName, counterName: 'SortsDropdownError', log });

    return null;
  }

  return (
    <CatalogFilter<number>
      filter={{
        filterDropdownName: translate('Label.Filter.SortBy'),
        filterDisplayName:
          selectedSortType.hasSubMenu && selectedSortAggregation
            ? translate('Label.SortByTypeAndAggregation', {
                sortType: selectedSortType.name,
                sortAggregation: selectedSortAggregation.name
              })
            : translate('Label.SortByType', { sortType: selectedSortType.name }),
        filterOptions: filters,
        secondaryFilterProps: {
          secondaryFilterOptions: secondaryFilters,
          selectedSecondaryOptionId:
            selectedSortAggregation?.sortAggregation || defaultSortAggregationValue.sortAggregation,
          defaultSecondaryOption: defaultSortAggregationValue.sortAggregation
        },
        selectedOptionId: selectedSortType.sortType,
        defaultOptionId: defaultSortValue.sortType
      }}
      updateFilterValue={(newOptionValue, textValues, newSecondaryOptionValue) => {
        if (newOptionValue) {
          onSortTypeChanged(newOptionValue.optionId);
        }
        if (newSecondaryOptionValue) {
          onSortAggregationChanged(newSecondaryOptionValue.optionId);
        }
      }}
      translate={translate}
      intl={intl}
    />
  );
}

export default withTranslations(SortsDropdown, translationConfig);
