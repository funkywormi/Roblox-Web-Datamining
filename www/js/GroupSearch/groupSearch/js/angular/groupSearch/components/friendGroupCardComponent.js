import groupSearchModule from '../groupSearchModule';

const friendGroupCard = {
  templateUrl: 'friend-group-card',
  bindings: {
    group: '<',
    friends: '<',
    handleClick: '<',
    isV2: '<'
  },
  controller: 'friendGroupCardController'
};

groupSearchModule.component('friendGroupCard', friendGroupCard);

export default friendGroupCard;
