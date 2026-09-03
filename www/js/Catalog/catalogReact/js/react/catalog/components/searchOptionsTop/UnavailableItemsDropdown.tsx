import React, { useMemo } from 'react';
import { WithTranslationsProps, withTranslations } from 'react-utilities';
import CatalogFilter, { TFilterOption } from './filterDropdown/CatalogFilter';
import translationConfig from '../../translation.config';

export type UnavailableItemsDropdownProps = {
  includeNotForSale: boolean;
  onUnavailableFilterChanged: (value: boolean) => void;
};

function UnavailableItemsDropdown({
  includeNotForSale,
  onUnavailableFilterChanged,
  translate,
  intl
}: UnavailableItemsDropdownProps & WithTranslationsProps): JSX.Element {
  const { hideUnavailableItems, showUnavailableItems } = useMemo(() => {
    const hide: TFilterOption<string> = {
      optionId: '1',
      optionDisplayName: translate('Action.Hid'),
      optionValue: false
    };

    const show: TFilterOption<string> = {
      optionId: '2',
      optionDisplayName: translate('Action.Show'),
      optionValue: true
    };

    return {
      hideUnavailableItems: hide,
      showUnavailableItems: show
    };
  }, [translate]);

  const filterOptions: TFilterOption<string>[] = useMemo(() => {
    return [hideUnavailableItems, showUnavailableItems];
  }, [hideUnavailableItems, showUnavailableItems]);

  return (
    <CatalogFilter<string>
      filter={{
        filterDropdownName: translate('Label.Filter.UnavailableItems'),
        filterDisplayName: includeNotForSale
          ? translate('Label.ShowUnavailableItems')
          : translate('Label.Filter.UnavailableItems'),
        filterOptions,
        selectedOptionId: includeNotForSale
          ? showUnavailableItems.optionId
          : hideUnavailableItems.optionId,
        defaultOptionId: hideUnavailableItems.optionId
      }}
      updateFilterValue={newOptionValue => {
        onUnavailableFilterChanged(newOptionValue?.optionValue);
      }}
      translate={translate}
      intl={intl}
    />
  );
}

export default withTranslations(UnavailableItemsDropdown, translationConfig);
