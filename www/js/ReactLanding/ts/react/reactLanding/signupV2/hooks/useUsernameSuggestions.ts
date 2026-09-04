import { useEffect, useRef, useState } from 'react';
import { usernameMinLength } from '../../constants/signupConstants';
import { postUsernameSuggestions } from '../../services/signupService';

export type UseUsernameSuggestionsParams = {
  username: string;
  birthday?: Date;
  isEnabled: boolean;
  onSuggestionsShown?: (username: string, suggestions: string[]) => void;
};

const useUsernameSuggestions = ({
  username,
  birthday,
  isEnabled,
  onSuggestionsShown
}: UseUsernameSuggestionsParams): string[] => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const requestIdRef = useRef(0);
  const birthdayTime = birthday?.getTime();

  useEffect(() => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    if (
      !isEnabled ||
      username.length < usernameMinLength ||
      birthday === undefined ||
      birthdayTime === undefined ||
      Number.isNaN(birthdayTime)
    ) {
      setSuggestions([]);
      return undefined;
    }

    const fetchSuggestions = async (): Promise<void> => {
      try {
        const response = await postUsernameSuggestions({
          Username: username,
          Birthday: birthday
        });
        if (requestId !== requestIdRef.current) {
          return;
        }

        const nextSuggestions =
          response.didGenerateNewUsername && response.suggestedUsernames.length > 0
            ? response.suggestedUsernames
            : [];
        setSuggestions(nextSuggestions);
        if (nextSuggestions.length > 0) {
          onSuggestionsShown?.(username, nextSuggestions);
        }
      } catch {
        if (requestId === requestIdRef.current) {
          setSuggestions([]);
        }
      }
    };

    fetchSuggestions().catch(() => undefined);
    return () => {
      if (requestIdRef.current === requestId) {
        requestIdRef.current += 1;
      }
    };
  }, [birthday, birthdayTime, isEnabled, onSuggestionsShown, username]);

  return suggestions;
};

export default useUsernameSuggestions;
