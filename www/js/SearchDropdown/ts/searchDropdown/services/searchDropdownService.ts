import { ThumbnailTypes } from 'roblox-thumbnails';
import { httpService } from 'core-utilities';
import { AxiosPromise } from 'axios';
import {
  searchDropdownConstants,
  termLengths,
  searchUrls
} from '../constants/searchDropdownConstants';
import SearchTargetType from '../enums/SearchTargetType';
import GroupSearchResponse from '../interfaces/GroupSearchResponse';
import UserSearchResponse from '../interfaces/UserSearchResponse';
import SearchResult from '../interfaces/SearchResult';

// Call endpoints
const getGroupByName = (groupName: string): AxiosPromise<GroupSearchResponse> => {
  const config = {
    url: searchUrls.groupLookup
  };

  const params = {
    groupName
  };
  return httpService.get(config, params);
};

const getUserByUsername = (
  username: string,
  excludeBannedUsers = false
): AxiosPromise<UserSearchResponse> => {
  const config = {
    url: searchUrls.userLookup
  };

  // Endpoint takes in array
  const usernames = [username];
  const request = {
    usernames,
    excludeBannedUsers
  };

  return httpService.post(config, request);
};

const searchUsersByUsername = (username: string): AxiosPromise<UserSearchResponse> => {
  const config = {
    url: searchUrls.userSearch
  };

  const params = {
    keyword: username,
    limit: searchDropdownConstants.maxResults
  };

  return httpService.get(config, params);
};

// Format data
const searchGroups = (searchTerm: string): Promise<SearchResult[]> => {
  return new Promise((resolve, reject) => {
    getGroupByName(searchTerm).then(
      response => {
        if (response.data?.data?.length > 0) {
          const returnData = response.data.data.slice(0, searchDropdownConstants.maxResultsShown);
          resolve(returnData);
        }
        resolve([]);
      },
      () => {
        reject();
      }
    );
  });
};

const searchUsers = (searchTerm: string): Promise<SearchResult[]> => {
  return new Promise((resolve, reject) => {
    searchUsersByUsername(searchTerm)
      .then(response => {
        if (response.data?.data?.length > 0) {
          if (response.data.data[0].name.toLowerCase() !== searchTerm.toLowerCase()) {
            // It's possible that there isn't a direct match for this, but there is an issue
            // where sometimes we incorrectly index users in elasticsearch and this prevents
            // them from showing up in search. Until that is fixed, we will have a fallback here.
            getUserByUsername(searchTerm, true)
              .then(lookupResponse => {
                if (lookupResponse.data?.data?.length > 0) {
                  const returnData = response.data.data.slice(
                    0,
                    searchDropdownConstants.maxResultsShown - 1
                  );
                  returnData.unshift(lookupResponse.data.data[0]);
                  resolve(returnData);
                } else {
                  throw new Error('Direct lookup did not return any results');
                }
              })
              .catch(() => {
                const returnData = response.data.data.slice(
                  0,
                  searchDropdownConstants.maxResultsShown
                );
                resolve(returnData);
              });
          } else {
            const returnData = response.data.data.slice(0, searchDropdownConstants.maxResultsShown);
            resolve(returnData);
          }
        } else {
          throw new Error('Search did not return any results');
        }
      })
      .catch(() => {
        // Fall back to the lookup endpoint
        getUserByUsername(searchTerm, true).then(
          lookupResponse => {
            if (lookupResponse.data?.data?.length > 0) {
              resolve(lookupResponse.data.data);
            } else {
              resolve([]);
            }
          },
          () => {
            reject();
          }
        );
      });
  });
};

function searchTargetByName(
  searchTerm: string,
  targetType: SearchTargetType
): Promise<SearchResult[]> {
  return new Promise((resolve, reject) => {
    const { minLength, maxLength } = termLengths[targetType];
    if (!searchTerm || searchTerm.length <= minLength || searchTerm.length > maxLength) {
      // Search term is too long or too short, we currently don't show an error for this
      reject();
      return;
    }

    switch (targetType) {
      case SearchTargetType.Group:
        resolve(searchGroups(searchTerm));
        break;
      case SearchTargetType.User:
      default:
        resolve(searchUsers(searchTerm));
    }
  });
}

function getThumbnailTypeForTargetType(targetType: SearchTargetType): ThumbnailTypes {
  switch (targetType) {
    case SearchTargetType.Group:
      return ThumbnailTypes.groupIcon;
    case SearchTargetType.User:
    default:
      return ThumbnailTypes.avatarHeadshot;
  }
}

function getPlaceholderTranslationKeyForTargetType(targetType: SearchTargetType): string {
  switch (targetType) {
    case SearchTargetType.Group:
      return 'Label.GroupName';
    case SearchTargetType.User:
    default:
      return 'Label.Username';
  }
}

export default {
  searchTargetByName,
  getThumbnailTypeForTargetType,
  getPlaceholderTranslationKeyForTargetType
};
