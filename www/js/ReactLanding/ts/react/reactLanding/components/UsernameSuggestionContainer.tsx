/* eslint-disable react/jsx-no-literals */
import React, { useEffect, useState, useRef } from 'react';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { signupTranslationConfig } from '../translation.config';
import UsernameSuggestionPill from './UsernameSuggestionPill';
import { postUsernameSuggestions } from '../services/signupService';
import {
  TPostUsernameSuggestionsParams,
  TPostUsernameSuggestionsResponse
} from '../../common/types/signupTypes';
import { signupFormStrings, experimentVariables } from '../constants/signupConstants';
import { experimentLayer } from '../constants/landingConstants';
import {
  sendAuthButtonClickEvent,
  sendUsernameSuggestionShownEvent
} from '../services/eventService';
import EVENT_CONSTANTS from '../../common/constants/eventsConstants';
import useExperiments from '../../common/hooks/useExperiments';
import cleanUsernameForSuggestions from '../utils/cleanUsernameForSuggestions';

interface UsernameSuggestionContainerProps {
  inputUsername: string;
  birthday: Date;
  onUsernameClicked: (username: string) => void;
  translate: WithTranslationsProps['translate'];
}

const UsernameSuggestionContainer: React.FC<UsernameSuggestionContainerProps> = ({
  inputUsername,
  birthday,
  onUsernameClicked,
  translate
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const lastCleanedUsernameRef = useRef<string>('');

  // Get experiment values
  const experiments = useExperiments(experimentLayer);
  const shouldCleanUsernameSuggestionInput = experiments[
    experimentVariables.shouldCleanUsernameSuggestionInput
  ] as boolean;
  const shouldDisableClearingUsernameSuggestions = experiments[
    experimentVariables.shouldDisableClearingUsernameSuggestions
  ] as boolean;

  // Determine if any experiment is active
  const isExperimentActive =
    shouldCleanUsernameSuggestionInput || shouldDisableClearingUsernameSuggestions;

  useEffect(
    () => {
      if (isExperimentActive) {
        // EXPERIMENT LOGIC - Enhanced username suggestions with cleaning and persistence
        const fetchSuggestionsExperiment = async () => {
          // Clean the username input if the experiment is enabled
          const usernameSuggestionInput = shouldCleanUsernameSuggestionInput
            ? cleanUsernameForSuggestions(inputUsername)
            : inputUsername;

          // Don't make API calls with empty or very short usernames
          if (!usernameSuggestionInput || usernameSuggestionInput.length < 3) {
            return;
          }

          // In experiment mode, if the cleaned username is the same as what we last fetched for,
          // and we already have suggestions, don't make a new API call
          if (
            shouldDisableClearingUsernameSuggestions &&
            usernameSuggestionInput === lastCleanedUsernameRef.current &&
            suggestions.length > 0
          ) {
            return; // Don't make API call, preserve existing suggestions
          }

          const params: TPostUsernameSuggestionsParams = {
            Username: usernameSuggestionInput,
            Birthday: birthday
          };

          try {
            const response: TPostUsernameSuggestionsResponse = await postUsernameSuggestions(
              params
            );

            if (shouldDisableClearingUsernameSuggestions) {
              // Only update suggestions if we actually have new suggestions to show
              // Never clear existing suggestions in this mode
              if (response.suggestedUsernames && response.suggestedUsernames.length > 0) {
                setSuggestions(response.suggestedUsernames);
                const suggestionCsv = response.suggestedUsernames.join(',');
                sendUsernameSuggestionShownEvent(inputUsername, suggestionCsv);
                // Update the last cleaned username only when we successfully get suggestions
                lastCleanedUsernameRef.current = usernameSuggestionInput;
              }
              // Do NOT clear suggestions if response has no suggestions - PRESERVE existing ones
            } else if (
              response.didGenerateNewUsername &&
              response.suggestedUsernames &&
              response.suggestedUsernames.length > 0 &&
              response.suggestedUsernames !== suggestions
            ) {
              setSuggestions(response.suggestedUsernames);
              const suggestionCsv = response.suggestedUsernames.join(',');
              sendUsernameSuggestionShownEvent(inputUsername, suggestionCsv);
              lastCleanedUsernameRef.current = usernameSuggestionInput;
            }
          } catch (e) {
            // Only clear suggestions on error if the experiment is disabled
            if (!shouldDisableClearingUsernameSuggestions) {
              setSuggestions([]);
            }
            // In experiment mode, preserve existing suggestions even on API errors
            console.warn('Username suggestions API error:', e);
          }
        };

        fetchSuggestionsExperiment().catch(() => {
          // Error handling is already done inside fetchSuggestionsExperiment
        });
      } else {
        // ORIGINAL LOGIC - Default username suggestions behavior
        const fetchSuggestions = async () => {
          const params: TPostUsernameSuggestionsParams = {
            Username: inputUsername,
            Birthday: birthday
          };
          const response: TPostUsernameSuggestionsResponse = await postUsernameSuggestions(params);
          if (
            response.didGenerateNewUsername &&
            response.suggestedUsernames.length > 0 &&
            response.suggestedUsernames !== suggestions
          ) {
            setSuggestions(response.suggestedUsernames);
            const suggestionCsv = response.suggestedUsernames.join(',');
            sendUsernameSuggestionShownEvent(inputUsername, suggestionCsv);
          }
        };

        fetchSuggestions().catch(e => {
          setSuggestions([]); // clear suggestions on error
        });
      }
    },
    isExperimentActive
      ? [
          inputUsername,
          shouldCleanUsernameSuggestionInput,
          shouldDisableClearingUsernameSuggestions
        ]
      : [inputUsername]
  );

  function handleUsernameClick(username: string) {
    onUsernameClicked(username);
    sendAuthButtonClickEvent(
      EVENT_CONSTANTS.btn.usernameSuggestion,
      username,
      EVENT_CONSTANTS.context.signupForm
    );
  }

  if (suggestions.length === 0) {
    // early return if no suggestions
    return <div />;
  }

  return (
    <div className='username-suggestion-container'>
      <div className='username-suggestion-label font-caption-header'>
        {`${translate(signupFormStrings.Try)}:`}
      </div>
      <div className='username-suggestion-pill-container'>
        {suggestions.map((suggestion, _) => (
          <UsernameSuggestionPill
            key={suggestion}
            usernameSuggestion={suggestion}
            onUsernameClicked={() => handleUsernameClick(suggestion)}
          />
        ))}
      </div>
    </div>
  );
};

export default withTranslations(UsernameSuggestionContainer, signupTranslationConfig);
