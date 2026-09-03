import groupSearchModule from '../groupSearchModule';

const groupResults = {
  templateUrl: 'group-results',
  bindings: {
    pager: '<',
    groups: '<',
    errorMessage: '<',
    keyword: '<',
    handleViewGroupDetailsClick: '<',
    handleResultExposure: '<',
    friendsListMap: '<',
    isV2: '<',
    hideHeader: '<',
    handleBackClicked: '<',
    // props for custom pager
    getPrevPage: '<',
    getNextPage: '<',
    curPage: '<',
    hasNextPage: '<'
  },
  controller: 'groupResultsController'
};

groupSearchModule.component('groupResults', groupResults);

export default groupResults;
