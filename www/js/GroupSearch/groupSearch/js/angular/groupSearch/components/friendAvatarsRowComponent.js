import groupSearchModule from '../groupSearchModule';

const friendAvatarsRow = {
  templateUrl: 'friend-avatars-row',
  bindings: {
    friends: '<',
    maxNumberOfDisplayAvatars: '<'
  },
  controller: 'friendAvatarsRowController'
};

groupSearchModule.component('friendAvatarsRow', friendAvatarsRow);

export default friendAvatarsRow;
