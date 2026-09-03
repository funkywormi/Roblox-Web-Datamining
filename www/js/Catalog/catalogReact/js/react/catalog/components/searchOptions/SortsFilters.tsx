import React from 'react';
import { SortMenus, SortOption, SortAggregation } from '../../constants/types';

export type SortsFiltersProps = {
  sortMenus: SortMenus;
  sortType?: SortOption;
  onSortTypeChanged: (sortType: SortOption['sortType']) => void;
  sortAggregation?: SortAggregation | number;
  onSortAggregationChanged: (sortAggregation: SortAggregation['sortAggregation']) => void;
};

function SortsFilters({
  sortMenus,
  sortType,
  onSortTypeChanged,
  sortAggregation,
  onSortAggregationChanged
}: SortsFiltersProps): JSX.Element {
  const sortAggregationId =
    typeof sortAggregation === 'number' ? sortAggregation : sortAggregation?.sortAggregation;
  return (
    <ul>
      {sortMenus.sortOptions.map(sortOption => (
        <li key={sortOption.sortType} className='radio top-border font-caption-body'>
          <input
            type='radio'
            name='radio-sort-option'
            id={`radio-sort-option-${sortOption.sortType}`}
            checked={sortType?.sortType === sortOption.sortType}
            onChange={() => onSortTypeChanged(sortOption.sortType)}
          />
          <label htmlFor={`radio-sort-option-${sortOption.sortType}`}>{sortOption.name}</label>
          {sortOption.hasSubMenu && sortType?.sortType === sortOption.sortType && (
            <ul>
              {sortMenus.sortAggregations.map(sortAggregationOption => (
                <li
                  key={sortAggregationOption.sortAggregation}
                  className='radio top-border font-caption-body'>
                  <input
                    type='radio'
                    name='radio-sort-aggregation'
                    id={`radio-sort-aggregation-${sortAggregationOption.sortAggregation}`}
                    checked={sortAggregationId === sortAggregationOption.sortAggregation}
                    onChange={() => onSortAggregationChanged(sortAggregationOption.sortAggregation)}
                  />
                  <label
                    htmlFor={`radio-sort-aggregation-${sortAggregationOption.sortAggregation}`}>
                    {sortAggregationOption.name}
                  </label>
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );
}

export default SortsFilters;
