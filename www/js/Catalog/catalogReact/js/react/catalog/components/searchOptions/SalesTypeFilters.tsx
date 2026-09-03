import React from 'react';
import { SalesTypeFilter } from '../../constants/types';

export type SalesTypeFiltersProps = {
  salesTypeFilters: SalesTypeFilter[];
  salesTypeFilter?: SalesTypeFilter;
  onSalesTypeFilterChanged: (salesTypeFilter: SalesTypeFilter['filter']) => void;
};

function SalesTypeFilters({
  salesTypeFilters,
  salesTypeFilter,
  onSalesTypeFilterChanged
}: SalesTypeFiltersProps): JSX.Element {
  return (
    <ul>
      {salesTypeFilters.map(salesType => (
        <li key={salesType.filter} className='radio top-border font-caption-body'>
          <input
            type='radio'
            name='radio-sales-type'
            id={`radio-sales-type-${salesType.filter}`}
            value={salesType.filter}
            checked={salesTypeFilter?.filter === salesType.filter}
            onChange={() => onSalesTypeFilterChanged(salesType.filter)}
          />
          <label htmlFor={`radio-sales-type-${salesType.filter}`}>{salesType.name}</label>
        </li>
      ))}
    </ul>
  );
}

export default SalesTypeFilters;
