import type { ChangeEvent, FunctionComponent, KeyboardEvent } from 'react';
import React, { useCallback, useState } from 'react';
import type { TTextInputSize } from '@rbx/foundation-ui';
import { IconButton, TextInput } from '@rbx/foundation-ui';
import { useTranslation } from '@rbx/intl';

export type SearchInputProps = {
  className?: string;
  placeholder?: string;
  size?: TTextInputSize;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  onClear?: () => void;
};

/** Text input with a magnifying-glass affordance and a clear button. */
const SearchInput: FunctionComponent<SearchInputProps> = ({
  className,
  placeholder,
  size = 'Medium',
  onChange,
  onSubmit,
  onClear,
}) => {
  const { translate } = useTranslation();
  const [searchString, setSearchString] = useState<string>('');

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setSearchString(event.target.value);
      onChange?.(event.target.value);
    },
    [onChange],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        onSubmit?.(searchString);
      }
    },
    [onSubmit, searchString],
  );

  const handleClear = useCallback(() => {
    setSearchString('');
    onChange?.('');
    onClear?.();
  }, [onChange, onClear]);

  const canClear = searchString.length > 0;

  return (
    <TextInput
      className={className}
      value={searchString}
      size={size}
      leadingIconName='icon-regular-magnifying-glass'
      placeholder={placeholder}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      trailingIconNode={
        <IconButton
          className={canClear ? undefined : 'invisible'}
          icon='icon-regular-x'
          ariaLabel={translate('Action.Cancel')}
          size={size}
          variant='Utility'
          isDisabled={!canClear}
          onClick={handleClear}
        />
      }
    />
  );
};

export default SearchInput;
