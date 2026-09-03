import groupSearchModule from '../groupSearchModule';

const friendListItem = {
  templateUrl: 'friend-list-item',
  bindings: {
    url: '<',
    userId: '<',
    username: '<'
  },
  controller: 'friendListItemController'
};

groupSearchModule.component('friendListItem', friendListItem);

export default friendListItem;
