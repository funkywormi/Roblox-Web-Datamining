import createGroupModule from '../createGroupModule.js';

const createGroupPage = {
  templateUrl: 'create-group-page',
  controller: 'createGroupPageController'
};

createGroupModule.component('createGroupPage', createGroupPage);

export default createGroupPage;
