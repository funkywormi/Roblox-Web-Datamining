import { EnvironmentUrls } from 'Roblox';
import SearchTargetType from '../enums/SearchTargetType';

interface TermLengths {
  minLength: number;
  maxLength: number;
}

export const searchDropdownConstants = {
  maxResultsShown: 5,
  maxResults: 10,
  timeout: 300
};

export const termLengths: { [key in SearchTargetType]: TermLengths } = {
  [SearchTargetType.User]: { minLength: 2, maxLength: 20 },
  [SearchTargetType.Group]: { minLength: 2, maxLength: 50 }
};

export const searchUrls = {
  groupLookup: `${EnvironmentUrls.groupsApi}/v1/groups/search/lookup`,
  userSearch: `${EnvironmentUrls.usersApi}/v1/users/search`,
  userLookup: `${EnvironmentUrls.usersApi}/v1/usernames/users`
};
