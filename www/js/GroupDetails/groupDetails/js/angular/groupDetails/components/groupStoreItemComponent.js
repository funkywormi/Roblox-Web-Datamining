import groupModule from '../groupModule';

const groupStoreItem = {
  templateUrl: 'group-store-item',
  bindings: {
    item: '<'
  },
  controller: 'groupStoreItemController'
};

groupModule.component('groupStoreItem', groupStoreItem);

export default groupStoreItem;
