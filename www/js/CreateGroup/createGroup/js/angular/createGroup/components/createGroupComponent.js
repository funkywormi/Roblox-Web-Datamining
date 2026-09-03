import createGroupModule from '../createGroupModule';

const createGroup = {
  templateUrl: 'create-group',
  controller: 'createGroupPageController',
  bindings: {
    metadata: '<',
    policies: '<'
  }
};

createGroupModule.component('createGroup', createGroup);
export default createGroup;
