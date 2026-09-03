import { IconButton, TextInput, TTextInputSize } from '@rbx/foundation-ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-utilities';

type SearchInputProps = {
  placeholder?: string;
  size?: TTextInputSize;
  onChange?: (newValue: string) => void;
  onBlur?: (value: string) => void;
  onSubmit?: (value: string) => void;
  onClear?: () => void;
};

const SearchInput: React.FC<SearchInputProps> = ({
  placeholder,
  size,
  onChange,
  onBlur,
  onSubmit,
  onClear
}) => {
  const { translate } = useTranslation();

  const [searchString, setSearchString] = useState<string>('');

  const onChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = event.target.value;
    setSearchString(searchValue);
    onChange?.(searchValue);
  };

  const onBlurHandler = () => {
    onBlur?.(searchString);
  };

  const onKeyDownHandler = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      onSubmit?.(searchString);
    }
  };

  const clearSearchInput = () => {
    setSearchString('');
    onChange?.('');
    onClear?.();
  };

  const canClearSearchInput = searchString && searchString.length > 0;

  const searchClearButton = (
    <IconButton
      className={!canClearSearchInput ? 'invisible' : ''}
      icon='icon-regular-x'
      ariaLabel={translate('Action.Cancel')}
      size={size}
      variant='Utility'
      isDisabled={!canClearSearchInput}
      onClick={clearSearchInput}
    />
  );

  return (
    <TextInput
      value={searchString}
      size={size}
      leadingIconName='icon-regular-magnifying-glass'
      placeholder={placeholder}
      onChange={onChangeHandler}
      onBlur={onBlurHandler}
      onKeyDown={onKeyDownHandler}
      trailingIconNode={searchClearButton}
    />
  );
};

export default SearchInput;
