import React from 'react';
import { Chip } from '@rbx/foundation-ui';

export type UsernameSuggestionsProps = {
  label: string;
  suggestions: string[];
  isDisabled?: boolean;
  onSelect: (suggestion: string) => void;
};

const UsernameSuggestions = ({
  label,
  suggestions,
  isDisabled = false,
  onSelect
}: UsernameSuggestionsProps): JSX.Element | null => {
  if (suggestions.length === 0) {
    return null;
  }

  const labelId = 'signup-v2-username-suggestions-label';
  const labelText = `${label}:`;

  return (
    <div role='group' aria-labelledby={labelId} className='flex items-start gap-small'>
      <span id={labelId} className='content-emphasis text-title-small padding-top-xsmall shrink-0'>
        {labelText}
      </span>
      <div className='flex flex-col items-start gap-small'>
        {suggestions.map(suggestion => (
          <Chip
            key={suggestion}
            text={suggestion}
            size='Medium'
            variant='Standard'
            isChecked={false}
            isDisabled={isDisabled}
            onMouseDown={(event: React.MouseEvent<HTMLButtonElement>) => event.preventDefault()}
            onCheckedChange={() => onSelect(suggestion)}
          />
        ))}
      </div>
    </div>
  );
};

export default UsernameSuggestions;
