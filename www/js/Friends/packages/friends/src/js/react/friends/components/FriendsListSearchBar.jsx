import React, { useCallback, useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { withTranslations } from 'react-utilities';
import translationConfig from '../translation.config';
import appContainer from '../containers/appContainer';

function FriendsListSearchBar({ handleSearchValueChange, translate }) {
  const [searchValue, setSearchValue] = useState('');

  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(func, delay, ...args);
    };
  };

  const debouncedHandleSearch = useCallback(
    debounce(value => {
      handleSearchValueChange((value || '').trim());
    }, 300),
    []
  );

  const handleValueChange = e => {
    setSearchValue(e.target.value || undefined);
    debouncedHandleSearch(e.target.value);
  };

  return (
    <div className='friends-filter-searchbar-container form-control input-field'>
      <span className='icon-search' />
      <input
        className='friends-filter-searchbar-input'
        type='text'
        value={searchValue || ''}
        onChange={handleValueChange}
        placeholder={translate('Label.FilterFriends')}
      />
    </div>
  );
}

FriendsListSearchBar.propTypes = {
  handleSearchValueChange: PropTypes.func.isRequired,
  translate: PropTypes.func.isRequired
};

export default withTranslations(appContainer(FriendsListSearchBar), translationConfig);
