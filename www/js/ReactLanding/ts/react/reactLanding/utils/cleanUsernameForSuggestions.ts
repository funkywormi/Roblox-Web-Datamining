/**
 * Cleans a username input to improve username suggestion generation.
 * Based on the mobile Lua implementation.
 *
 * @param usernameText - The raw username input
 * @returns The cleaned username suitable for suggestion generation
 */
const cleanUsernameForSuggestions = (usernameText: string): string => {
  let usernameSuggestionInput = usernameText;

  // can only contain alphanumeric characters and underscores
  usernameSuggestionInput = usernameSuggestionInput.replace(/[^\w]/g, '');

  // cannot start with an underscore
  if (usernameSuggestionInput.charAt(0) === '_') {
    usernameSuggestionInput = usernameSuggestionInput.substring(1);
  }

  // cannot end with an underscore
  if (usernameSuggestionInput.charAt(usernameSuggestionInput.length - 1) === '_') {
    usernameSuggestionInput = usernameSuggestionInput.substring(
      0,
      usernameSuggestionInput.length - 1
    );
  }

  // cannot have more than one underscore
  const firstUnderscore = usernameSuggestionInput.indexOf('_');
  if (firstUnderscore !== -1 && firstUnderscore < usernameSuggestionInput.length - 1) {
    usernameSuggestionInput =
      usernameSuggestionInput.substring(0, firstUnderscore + 1) +
      usernameSuggestionInput.substring(firstUnderscore + 1).replace(/_/g, '');
  }

  // since username suggestions appends numbers, in order to have
  // suggestions, we need the provided username to be less than 20 characters
  if (usernameSuggestionInput.length >= 20) {
    usernameSuggestionInput = usernameSuggestionInput.substring(0, 18);
  }

  return usernameSuggestionInput;
};

export default cleanUsernameForSuggestions;
