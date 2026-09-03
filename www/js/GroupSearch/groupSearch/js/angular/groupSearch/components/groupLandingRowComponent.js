import groupSearchModule from '../groupSearchModule';

const groupLandingRow = {
  templateUrl: 'group-landing-row',
  bindings: {
    keyword: '<',
    search: '=',
    handleViewGroupDetailsClick: '<',
    handleResultExposure: '<',
    isV2: '<',
    rowIndex: '<'
  },
  controller: 'groupLandingRowController'
};

groupSearchModule.component('groupLandingRow', groupLandingRow);

export default groupLandingRow;
