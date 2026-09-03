import groupSearchModule from '../groupSearchModule';

const groupResultCard = {
  templateUrl: 'group-result-card',
  bindings: {
    group: '<',
    friends: '<',
    handleClick: '<',
    showFriends: '<'
  },
  controller: 'groupResultCardController'
};

groupSearchModule.component('groupResultCard', groupResultCard);

export default groupResultCard;
