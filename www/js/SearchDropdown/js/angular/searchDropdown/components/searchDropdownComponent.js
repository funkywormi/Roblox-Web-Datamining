import searchDropdownModule from '../searchDropdownModule';

const searchDropdown = {
  templateUrl: 'search-dropdown',
  bindings: {
    targetType: '@',
    select: '<'
  },
  controller: 'searchDropdownController'
};

searchDropdownModule.component('searchDropdown', searchDropdown);

export default searchDropdown;
