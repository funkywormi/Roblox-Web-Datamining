import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Chip } from '@rbx/foundation-ui';
import { useTranslation } from 'react-utilities';
import { postUsernameSuggestions } from '../../services/signupService';
import { signupFormStrings, usernameMinLength } from '../../constants/signupConstants';

export type UsernameSuggestionsProps = {
  username: string;
  birthdate?: Date;
  isDisabled?: boolean;
  onChange: (value: string) => void;
  onSuggestionShown?: (suggestions: string[]) => void;
};

const UsernameSuggestions = ({
  username,
  birthdate,
  isDisabled,
  onChange,
  onSuggestionShown
}: UsernameSuggestionsProps): JSX.Element | null => {
  const { translate } = useTranslation();
  const { data: suggestionsData } = useQuery({
    queryKey: ['username-suggestions', username, birthdate],
    queryFn: async () => {
      const result = await postUsernameSuggestions({
        Username: username,
        // Query only runs if `birthdate != null` below
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        Birthday: birthdate!
      });

      const { suggestedUsernames } = result ?? {};

      // a populated list infers that suggestions were generated
      if (suggestedUsernames && suggestedUsernames.length > 0) {
        onSuggestionShown?.(suggestedUsernames);
      }
      return result;
    },
    enabled: username.length >= usernameMinLength && birthdate != null,
    keepPreviousData: true,
    cacheTime: 0 // TODO: configure cache behavior. Set to 0 here to avoid sudden change in suggestions once refetched.
    // We should consider enabling staleTime instead (and using default cacheTime).
  });

  const { didGenerateNewUsername, suggestedUsernames } = suggestionsData ?? {};

  if (
    username.length < usernameMinLength ||
    suggestedUsernames == null ||
    suggestedUsernames.length === 0 ||
    !didGenerateNewUsername
  ) {
    return null;
  }

  const labelId = 'signup-username-suggestions';
  return (
    <div
      role='group'
      aria-labelledby={labelId}
      className='flex flex-col gap-small padding-bottom-small'>
      <span id={labelId} className='text-title-small content-emphasis'>
        {translate(signupFormStrings.UsernameSuggestionsHeader)}
      </span>
      <ul className='flex wrap gap-small'>
        {suggestedUsernames.map(suggestion => (
          <Chip
            size='Medium'
            key={suggestion}
            text={suggestion}
            isChecked={false}
            isDisabled={isDisabled}
            onCheckedChange={() => {
              onChange(suggestion);
            }}
          />
        ))}
      </ul>
    </div>
  );
};

export default UsernameSuggestions;
