import { DisplayNames } from 'Roblox';
import { ThumbnailTypes } from 'roblox-thumbnails';
import searchDropdownModule from '../searchDropdownModule';
import {
  searchDropdownConstants,
  searchDropdownService as searchDropdownUtilities
} from '../../../../ts/searchDropdown';

function searchDropdownController($filter, $log, $timeout, keys, searchDropdownService) {
  'ngInject';

  const ctrl = this;

  const isNavigationEvent = event => {
    return event.key === keys.arrowUp || event.key === keys.arrowDown || event.key === keys.tab;
  };

  ctrl.onKeyDown = event => {
    if (isNavigationEvent(event)) {
      event.stopPropagation();
      event.preventDefault();
      let currentCursor = ctrl.layout.cursorIndex;

      if (event.key === keys.arrowUp) {
        currentCursor -= 1;
      } else {
        currentCursor += 1;
      }

      const numSearchResults = ctrl.data.searchResults.length;
      currentCursor %= numSearchResults;
      if (currentCursor < 0) {
        currentCursor = numSearchResults + currentCursor;
      }
      ctrl.layout.cursorIndex = currentCursor;
    }
  };

  const searchCompleted = searchTerm => {
    $timeout.cancel(ctrl.timeoutOnSearch);
    ctrl.layout.isSearchRequestSending = false;

    if (ctrl.layout.previousSearchTerm !== searchTerm) {
      ctrl.searchTargetByName(ctrl.layout.previousSearchTerm);
    }
  };

  ctrl.searchTargetByName = searchTerm => {
    ctrl.layout.isOpen = true;
    ctrl.layout.isSearchRequestSending = true;
    ctrl.layout.errorMessage = undefined;

    $timeout.cancel(ctrl.timeoutOnSearch);

    ctrl.timeoutOnSearch = $timeout(() => {
      $log.debug(` --- searchTerm after timeout ${searchTerm}`);

      searchDropdownService
        .searchTargetByName(searchTerm, ctrl.targetType)
        .then(
          searchResults => {
            ctrl.data.searchResults = searchResults;
          },
          () => {
            ctrl.layout.isOpen = false;
            ctrl.data.searchResults = [];
          }
        )
        .finally(() => {
          searchCompleted(searchTerm);
        });
    }, searchDropdownConstants.timeout);
  };

  ctrl.search = event => {
    if (isNavigationEvent(event)) {
      event.stopPropagation();
      event.preventDefault();
      return;
    }

    if (event.key === keys.enter) {
      event.stopPropagation();
      event.preventDefault();

      if (ctrl.layout.isSearchRequestSending) {
        return;
      }

      if (ctrl.data.searchResults.length > 0) {
        ctrl.selectOption(ctrl.data.searchResults[ctrl.layout.cursorIndex]);
        ctrl.layout.focusMe = false;
        event.target.blur();
      }
      return;
    }

    $log.debug(' --- search ----- ');
    if (!ctrl.data.searchTerm) {
      ctrl.layout.isOpen = false;
      ctrl.data.searchResults = [];
      return;
    }

    const searchTerm = ctrl.data.searchTerm.trim();
    if (searchTerm.length > 0) {
      $log.debug(' --- search ----- searchTerm', searchTerm);
      if (ctrl.timeoutOnSearch) {
        ctrl.layout.previousSearchTerm = searchTerm;
      }
      ctrl.searchTargetByName(searchTerm);
    }
  };

  ctrl.selectOption = searchResult => {
    ctrl.layout.isOpen = false;
    ctrl.layout.focusMe = false;
    ctrl.layout.isLoading = true;

    ctrl
      .select(searchResult)
      .then(
        () => {
          // Clear search term on successful select
          ctrl.data.searchTerm = '';
          ctrl.layout.previousSearchTerm = '';
          ctrl.data.searchResults = [];
        },
        errorMessage => {
          ctrl.data.searchTerm = searchResult.name;
          ctrl.layout.errorMessage = errorMessage;
        }
      )
      .finally(() => {
        ctrl.layout.isLoading = false;
      });
  };

  const init = () => {
    ctrl.thumbnailTypes = ThumbnailTypes;
    ctrl.thumbnailType = searchDropdownUtilities.getThumbnailTypeForTargetType(ctrl.targetType);

    ctrl.data = {
      searchResults: []
    };

    ctrl.layout = {
      focusMe: true,
      // Will use keyDown to calculate this once usernames endpoint returns multiple
      cursorIndex: 0,
      isDisplayNamesEnabled: DisplayNames.Enabled()
    };

    ctrl.layout.placeholder = $filter('translate')(
      searchDropdownUtilities.getPlaceholderTranslationKeyForTargetType(ctrl.targetType)
    );
  };

  ctrl.$onInit = init;
}

searchDropdownModule.controller('searchDropdownController', searchDropdownController);
export default searchDropdownController;
