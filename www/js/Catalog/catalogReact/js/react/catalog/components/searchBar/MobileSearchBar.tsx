import React, { useCallback } from 'react';
import classNames from 'classnames';
import { WithTranslationsProps, withTranslations } from 'react-utilities';
import translationConfig from '../../translation.config';
import TopicsCarousel, { TopicCarouselProps } from '../itemsContainer/components/TopicsCarousel';

export type MobileSearchBarProps = TopicCarouselProps & {
  toggleSearchOptions: (open: boolean) => void;
  search: (newValue: string) => void;
  isSearchOnBlurEnabled: boolean;
  searchInputValue: string;
  setSearchInputValue: (newValue: string) => void;
  numberOfAppliedFilters?: number;
};

const MobileSearchBar = (props: MobileSearchBarProps & WithTranslationsProps) => {
  const {
    toggleSearchOptions,
    search,
    searchInputValue,
    setSearchInputValue,
    isSearchOnBlurEnabled,
    numberOfAppliedFilters,
    topicBasedBrowsingEnabledForCategory,
    catalogQuery,
    topics,
    setSelectedTopics,
    onClearFilters,
    clearTopics
  } = props;

  const executeSearch = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault(); // Prevent form submission and page refresh
      search(searchInputValue);
    },
    [searchInputValue, search]
  );

  return (
    <div className={classNames('mobile-search-container')}>
      <div className='search-bar'>
        <button
          id='search-options-button'
          type='button'
          className='btn-generic-menu-black-md mobile-menu-button'
          onClick={() => toggleSearchOptions(true)}>
          <span className='icon-filter-menu-black' />
          {!!numberOfAppliedFilters && (
            <span className='mobile-menu-number-container'>
              <span className='mobile-menu-number'>{numberOfAppliedFilters}</span>
            </span>
          )}
        </button>
        <form
          name='forms.keywordForm'
          className='form-horizontal search-form'
          onSubmit={executeSearch}>
          <div className='form-group'>
            <div className='input-group'>
              <input
                className='form-control input-field search-input'
                placeholder='Search'
                type='text'
                maxLength={50}
                value={searchInputValue}
                onChange={e => {
                  const newValue = e.target.value;
                  setSearchInputValue(newValue);
                  if (isSearchOnBlurEnabled) {
                    search(newValue);
                  }
                }}
              />
              <div className='input-group-btn'>
                {/* type='submit' triggers the form's onSubmit (executeSearch); no
                    onClick here to avoid firing the search twice per tap. */}
                <button className='input-addon-btn' type='submit'>
                  <span className='icon-search' />
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
      <TopicsCarousel
        topicBasedBrowsingEnabledForCategory={topicBasedBrowsingEnabledForCategory}
        catalogQuery={catalogQuery}
        topics={topics}
        setSelectedTopics={setSelectedTopics}
        onClearFilters={onClearFilters}
        clearTopics={clearTopics}
      />
    </div>
  );
};

export default withTranslations(MobileSearchBar, translationConfig);
