import React, { useState, useEffect } from 'react';
import classNames from 'classnames';
import { WithTranslationsProps, withTranslations } from 'react-utilities';
import { Category, Subcategory } from '../../constants/types';
import { translationConfig } from '../../translation.config';

const canToggleSubmenu = (category: Category) => {
  const { subcategories } = category;
  return subcategories && subcategories.length > 0;
};

export type CategoryFilterProps = {
  currentCategory: Category | undefined;
  currentSubcategory: Subcategory | null | undefined;
  category: Category;
  updateCategory: (
    event: React.MouseEvent,
    clearFilters: boolean,
    shouldClearKeyword: boolean,
    newCategory: Category,
    newSubcategory: Subcategory | undefined
  ) => void;
  categoryClick: (event: React.MouseEvent, category: Category) => void;
  categoryNameClick: (event: React.MouseEvent, category: Category) => void;
};

export function CategoryFilter({
  currentCategory,
  currentSubcategory,
  category,
  updateCategory,
  categoryClick,
  categoryNameClick,
  translate
}: CategoryFilterProps & WithTranslationsProps): JSX.Element {
  const [isOpen, setIsOpen] = useState<boolean>();

  useEffect(() => {
    const currentCategoryId = currentCategory?.categoryId;
    if (!currentCategoryId) {
      return;
    }
    if (category.categoryId === currentCategoryId) {
      setIsOpen(true);
    } else {
      // The Angular category dropdown behaves this way, but I'm not sure if it's intentional and it seems a bit weird...
      // setIsOpen(false);
    }
  }, [category.categoryId, currentCategory?.categoryId]);

  return (
    <li className='font-header-2 text-subheader panel panel-default'>
      <div
        id={`expandable-menu-category-${category.categoryId}`}
        className='small text menu-link text-link-secondary panel-heading panel-heading-div panel-heading-layered-clothing-ui'
        role='tab'>
        <button
          type='button'
          className='category-name btn-text'
          onClick={e => categoryNameClick(e, category)}>
          {category.name}
        </button>
        {canToggleSubmenu(category) && (
          <button
            type='button'
            className={classNames('toggle-submenu', 'btn-text', {
              'icon-up': isOpen,
              'icon-down': !isOpen
            })}
            onClick={e => {
              categoryClick(e, category);
              setIsOpen(!isOpen);
            }}
            aria-label={translate(isOpen ? 'Action.Collapse' : 'Action.Expand')}
          />
        )}
      </div>
      <div
        className={classNames('panel-collapse', {
          collapse: !isOpen
        })}>
        <ul className='subcategory-menu'>
          {category.subcategories?.map(subcategory => (
            <li key={subcategory.subcategoryId} className='top-border'>
              <button
                type='button'
                className={classNames(
                  'small',
                  'text',
                  'menu-link',
                  'text-link-secondary',
                  'btn-text',
                  {
                    active:
                      currentCategory?.categoryId === category.categoryId &&
                      currentSubcategory?.subcategoryId === subcategory.subcategoryId
                  }
                )}
                onClick={e => updateCategory(e, false, true, category, subcategory)}>
                {subcategory.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </li>
  );
}

export default withTranslations(CategoryFilter, translationConfig);
