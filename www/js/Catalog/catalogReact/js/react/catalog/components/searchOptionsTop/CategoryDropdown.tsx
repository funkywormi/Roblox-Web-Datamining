import React, { useMemo } from 'react';
import { WithTranslationsProps, withTranslations } from 'react-utilities';
import { AXAnalyticsService } from 'Roblox';
import translationConfig from '../../translation.config';
import { Category, Subcategory } from '../../constants/types';
import CatalogFilter, { TFilterOption } from './filterDropdown/CatalogFilter';
import {
  getTaxonomy,
  getCategoryIdentifier,
  getSubcategoryIdentifier
} from '../../utils/taxonomyUtils';

export type CategoryDropdownProps = {
  categories: Category[] | undefined;
  currentCategory: Category | undefined;
  currentSubcategory: Subcategory | null | undefined;
  updateCategory: (
    event: React.MouseEvent | null,
    isSubcategory: boolean,
    isSelected: boolean,
    category: Category,
    subcategory?: Subcategory
  ) => void;
  defaultCategory?: Category;
};

function CategoryDropdown({
  categories,
  currentCategory,
  currentSubcategory,
  updateCategory,
  defaultCategory,
  translate,
  intl
}: CategoryDropdownProps & WithTranslationsProps): JSX.Element | null {
  const filters: TFilterOption<string>[] = useMemo(() => {
    const result =
      categories?.map(category => {
        // Use taxonomy if available, otherwise fall back to categoryId
        const categoryIdentifier = getCategoryIdentifier(category);

        const subOptions =
          category.subcategories?.map(subcategory => {
            // Use taxonomy if available, otherwise fall back to subcategoryId
            const subcategoryIdentifier = getSubcategoryIdentifier(subcategory);

            return {
              optionId: subcategoryIdentifier,
              optionDisplayName: subcategory.name,
              optionValue: subcategoryIdentifier
            };
          }) || [];

        const filterOption: TFilterOption<string> = {
          optionId: categoryIdentifier,
          optionDisplayName: category.name,
          optionValue: categoryIdentifier,
          subOptions
        };
        return filterOption;
      }) || [];
    return result;
  }, [categories]);

  if (!currentCategory) {
    return null;
  }

  if (!defaultCategory) {
    const itemName = `CategoryDropdown_NoDefault`;
    const log = JSON.stringify({
      message: 'Unable to render CategoryDropdown because defaultCategory was not found!'
    });
    // Report the error
    // We need to specify container name as counters name so we can build the graphs on grafana
    AXAnalyticsService.reportAXError({ itemName, counterName: 'CategoryDropdownError', log });

    return null;
  }

  return (
    <CatalogFilter<string>
      filter={{
        filterDropdownName: translate('Heading.CatalogCategory'),
        filterDisplayName: currentSubcategory?.name || currentCategory?.name || '',
        filterOptions: filters,
        selectedOptionId: currentSubcategory
          ? getSubcategoryIdentifier(currentSubcategory)
          : getCategoryIdentifier(currentCategory),
        defaultOptionId: getCategoryIdentifier(defaultCategory)
      }}
      updateFilterValue={newOptionValue => {
        if (!newOptionValue?.optionId) return;

        let matchingCategory: Category | undefined;
        let matchingSubcategory: Subcategory | undefined;

        const selectedId = newOptionValue.optionId;

        // eslint-disable-next-line no-restricted-syntax
        for (const category of categories || []) {
          // Check if this is a category match (taxonomy or fallback ID)
          const categoryIdentifier = getCategoryIdentifier(category);
          if (selectedId === categoryIdentifier) {
            matchingCategory = category;
            break;
          }

          // Check subcategories for match (taxonomy or fallback ID)
          // eslint-disable-next-line no-restricted-syntax
          for (const subcategory of category.subcategories || []) {
            const subcategoryIdentifier = getSubcategoryIdentifier(subcategory);
            if (selectedId === subcategoryIdentifier) {
              matchingSubcategory = subcategory;
              matchingCategory = category;
              break;
            }
          }
        }

        if (!matchingCategory) {
          return;
        }

        const isSubcategory = !!matchingSubcategory;
        const isCurrentlySelected = matchingSubcategory
          ? getSubcategoryIdentifier(matchingSubcategory) ===
            (currentSubcategory ? getSubcategoryIdentifier(currentSubcategory) : '')
          : getCategoryIdentifier(matchingCategory) === getCategoryIdentifier(currentCategory);

        updateCategory(
          null,
          isSubcategory,
          isCurrentlySelected,
          matchingCategory,
          matchingSubcategory
        );
      }}
      showDivider
      translate={translate}
      intl={intl}
    />
  );
}

export default withTranslations(CategoryDropdown, translationConfig);
