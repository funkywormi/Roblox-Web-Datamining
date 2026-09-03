import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-utilities';
import { TTextInputSize } from '@rbx/foundation-ui';
import SearchInput from './SearchInput';

type SearchableListProps = {
  items: Array<any>;
  searchInputSize?: TTextInputSize;
  searchContainerClassName?: string;
  placeholder?: string;
  emptyMessage?: string;
  matchFunction: (data: any, searchQuery: string) => boolean;
  renderItem: (data: any) => React.ReactNode;
};

const SearchableList: React.FC<SearchableListProps> = ({
  items,
  searchInputSize,
  searchContainerClassName,
  placeholder,
  emptyMessage,
  matchFunction,
  renderItem
}) => {
  const { translate } = useTranslation();
  const [searchQuery, setSearchQuery] = useState<string>('');

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  const filteredItems = useMemo(() => items.filter(item => matchFunction(item, searchQuery)), [
    items,
    searchQuery,
    matchFunction
  ]);

  return (
    <React.Fragment>
      <div className={searchContainerClassName}>
        <SearchInput
          size={searchInputSize}
          placeholder={placeholder || translate('Label.Search')}
          onChange={(value: string) => setSearchQuery(value)}
        />
      </div>
      {filteredItems.map(item => renderItem(item))}
      {filteredItems.length === 0 ? (
        <div className='padding-medium text-center text-subdued text-body-medium'>
          {emptyMessage || translate('Label.NoResults', { searchTerm: searchQuery })}
        </div>
      ) : null}
    </React.Fragment>
  );
};

export default SearchableList;
