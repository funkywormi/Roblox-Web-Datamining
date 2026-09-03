import React, { useState, useEffect, useRef } from 'react';
import classNames from 'classnames';
import { WithTranslationsProps, withTranslations } from 'react-utilities';
import ShoppingCartButton from '../../../shoppingCart/components/ShoppingCartButton';
import { AutocompleteSuggestions, Category, Library, Subcategory } from '../../constants/types';
import translationConfig from '../../translation.config';
import MarketplaceOfferBanner from '../marketplaceOfferModal/MarketplaceOfferBanner';

export type SearchBarProps = {
  searchInputValue: string;
  setSearchInputValue: (newValue: string) => void;
  search: (newValue: string) => void;
  autocompleteSuggestions: AutocompleteSuggestions;
  categories?: Category[];
  hasSearchOptionsError?: boolean;
  //
  library: Library;
  // Methods passed as props
  onClickOutsideAutocomplete: () => void;
  onKeywordKeydown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onKeywordInputClicked: (event: React.MouseEvent<HTMLInputElement>) => void;
  onKeywordClear: (
    event: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLInputElement>
  ) => void;
  onAutocompleteSuggestionClicked: (query: string, index: number) => void;
  updateCategory: (
    event: React.MouseEvent,
    clearFilters: boolean,
    shouldClearKeyword: boolean,
    newCategory: Category,
    newSubcategory: Subcategory | undefined
  ) => void;
  buyRobuxButtonOnClick: () => void;
  buyRobuxButtonUrl: string;
  getCategoryDropdownValue: () => string;
  isSearchOnBlurEnabled: boolean;
  searchBarOnly?: boolean;
};

function SearchBar(props: SearchBarProps & WithTranslationsProps): JSX.Element {
  const {
    searchInputValue,
    setSearchInputValue,
    autocompleteSuggestions,
    categories,
    hasSearchOptionsError,
    library,
    onClickOutsideAutocomplete,
    onKeywordKeydown,
    onKeywordInputClicked,
    onKeywordClear,
    onAutocompleteSuggestionClicked,
    updateCategory,
    search,
    buyRobuxButtonOnClick,
    buyRobuxButtonUrl,
    getCategoryDropdownValue,
    isSearchOnBlurEnabled,
    translate,
    searchBarOnly
  } = props;

  const searchContainerClasses = classNames(
    'search-container',
    'search-container-no-categories',
    'search-container-original'
  );

  const inputClasses = classNames('form-control', 'input-field', 'search-input', 'input-rounded');

  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchBarContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!categories) {
      return;
    }
    const isSearchableCategory = (category: Category): boolean => {
      return category.isSearchable ?? true;
    };

    // Perform filtering and sorting when the component mounts or when navigationMenu.categories changes
    const sortedAndFilteredCategories: Category[] =
      categories?.filter(isSearchableCategory).sort((a, b) => a.orderIndex - b.orderIndex) || [];

    setFilteredCategories(sortedAndFilteredCategories);
  }, [categories]);

  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Assert that event.target is an Element to satisfy TypeScript's type checking
      const target = event.target as Element;

      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setIsDropdownOpen(false);
      }
      if (searchBarContainerRef.current && !searchBarContainerRef.current.contains(target)) {
        onClickOutsideAutocomplete();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsDropdownOpen, onClickOutsideAutocomplete]);

  return (
    <div className={searchContainerClasses} id='search-bar'>
      <div className='input-group'>
        <div id='search-bar-container' ref={searchBarContainerRef}>
          <input
            id='avatar-shop-keyword-input'
            className={inputClasses}
            placeholder={translate('Label.SearchField')}
            maxLength={50}
            onKeyDown={onKeywordKeydown}
            value={searchInputValue}
            onChange={e => {
              const newValue = e.target.value;
              setSearchInputValue(newValue);
              if (isSearchOnBlurEnabled) {
                search(newValue);
              }
            }}
            onClick={onKeywordInputClicked}
            autoComplete='off'
            autoCorrect='off'
            spellCheck='false'
            name='searchField'
            type='text'
          />
          {!!searchInputValue.length && (
            <span
              id='navbar-search-clear-btn'
              tabIndex={0}
              role='button'
              aria-label='Clear Search'
              className='clear-search icon-actions-clear-sm'
              onClick={(e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
                onKeywordClear(e);
              }}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  onKeywordClear(e);
                }
              }}
            />
          )}
          {!!searchInputValue.length && autocompleteSuggestions.show && (
            <div className='autocomplete-dropdown-menu open'>
              <ul id='autocomplete-list' className='dropdown-menu' role='menu'>
                {autocompleteSuggestions.suggestions.map((suggestion, index) => (
                  <li id={`autocomplete-suggestion-li-${index}`} key={suggestion.Query}>
                    <button
                      type='button'
                      id={`autocomplete-suggestion-${index}`}
                      onClick={() => onAutocompleteSuggestionClicked(suggestion.Query, index)}>
                      <span className='navbar-list-option-icon icon-search' />
                      <span>{suggestion.Query}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        {searchBarOnly ? (
          <React.Fragment>
            <div ref={dropdownRef} className='input-group-btn-category input-group-btn'>
              <button
                className='input-addon-btn'
                type='submit'
                onClick={() => search(searchInputValue)}>
                <span className='icon-search' />
              </button>
            </div>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <div ref={dropdownRef} className='input-group-btn-category input-group-btn'>
              {!hasSearchOptionsError && (
                <button
                  type='button'
                  className='input-dropdown-btn category-options'
                  disabled={hasSearchOptionsError}
                  aria-haspopup='true'
                  aria-expanded={isDropdownOpen ? 'true' : 'false'}
                  onClick={() => {
                    setIsDropdownOpen(!isDropdownOpen);
                  }}>
                  <span className='text-overflow rbx-selection-label'>
                    {getCategoryDropdownValue()}
                  </span>
                  <span className='icon-down-16x16' />
                </button>
              )}
              <ul
                className='dropdown-menu'
                role='menu'
                style={{ display: isDropdownOpen ? 'block' : 'none' }}>
                {filteredCategories.map(category => (
                  <li key={category.name}>
                    <button
                      onClick={event => {
                        updateCategory(event, true, false, category, undefined);
                        setIsDropdownOpen(false);
                      }}
                      type='button'>
                      {category.name}
                    </button>
                  </li>
                ))}
              </ul>
              <button
                className='input-addon-btn'
                type='submit'
                onClick={() => search(searchInputValue)}>
                <span className='icon-search' />
              </button>
            </div>
            <div className='buy-btns-container'>
              <MarketplaceOfferBanner />
              <a
                className='btn-growth-md buy-robux'
                href={buyRobuxButtonUrl}
                target='_self'
                onClick={buyRobuxButtonOnClick}>
                {translate('Action.BuyRobux')}
              </a>
              <ShoppingCartButton />
            </div>
          </React.Fragment>
        )}
      </div>
    </div>
  );
}

export default withTranslations(SearchBar, translationConfig);
