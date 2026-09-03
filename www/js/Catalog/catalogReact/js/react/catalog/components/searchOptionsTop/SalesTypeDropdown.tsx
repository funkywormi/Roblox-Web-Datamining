import React, { useMemo } from 'react';
import { WithTranslationsProps, withTranslations } from 'react-utilities';
import { AXAnalyticsService } from 'Roblox';
import CatalogFilter, { TFilterOption } from './filterDropdown/CatalogFilter';
import { SalesTypeFilter } from '../../constants/types';
import translationConfig from '../../translation.config';

export type SalesTypeDropdownProps = {
  salesTypeFilters: SalesTypeFilter[];
  salesTypeFilter?: SalesTypeFilter;
  onSalesTypeFilterChanged: (salesTypeFilter: SalesTypeFilter['filter']) => void;
  defaultSalesType?: SalesTypeFilter;
};

function SalesTypeDropdown({
  salesTypeFilters,
  salesTypeFilter,
  onSalesTypeFilterChanged,
  defaultSalesType,
  translate,
  intl
}: SalesTypeDropdownProps & WithTranslationsProps): JSX.Element | null {
  const filters: TFilterOption<number>[] = useMemo(() => {
    return salesTypeFilters.map(filter => {
      const filterOption: TFilterOption<number> = {
        optionId: filter.filter,
        optionDisplayName: filter.name,
        optionValue: filter.filter
      };
      return filterOption;
    });
  }, [salesTypeFilters]);

  if (!defaultSalesType) {
    const itemName = `SalesTypeDropdown_NoDefault`;
    const log = JSON.stringify({
      message: 'Unable to render SalesTypeDropdown because defaultSalesType was not found!'
    });
    // Report the error
    // We need to specify container name as counters name so we can build the graphs on grafana
    AXAnalyticsService.reportAXError({ itemName, counterName: 'SalesTypeDropdownError', log });

    return null;
  }

  const isDefaultSalesTypeSelected = salesTypeFilter?.filter === defaultSalesType.filter;

  return (
    <CatalogFilter<number>
      filter={{
        filterDropdownName: translate('Label.Filter.SalesType'),
        filterDisplayName:
          isDefaultSalesTypeSelected || !salesTypeFilter
            ? translate('Label.Filter.SalesType')
            : salesTypeFilter.name,
        filterOptions: filters,
        selectedOptionId: salesTypeFilter ? salesTypeFilter.filter : defaultSalesType.filter,
        defaultOptionId: defaultSalesType.filter
      }}
      updateFilterValue={newOptionValue => {
        onSalesTypeFilterChanged(newOptionValue?.optionValue);
      }}
      translate={translate}
      intl={intl}
    />
  );
}

export default withTranslations(SalesTypeDropdown, translationConfig);
