import groupModule from '../groupModule';

const groupDescription = {
  templateUrl: 'group-description',
  bindings: {
    groupId: '<',
    description: '<',
    funds: '<',
    policies: '<'
  },
  controller: 'groupDescriptionController'
};

groupModule.component('groupDescription', groupDescription);

export default groupDescription;
