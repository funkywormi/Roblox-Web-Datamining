import groupsModule from '../groupsModule';

const groupCard = {
  templateUrl: 'group-card',
  bindings: {
    group: '<',
    handleClick: '<',
    isV2: '<'
  },
  controller: 'groupCardController'
};

groupsModule.component('groupCard', groupCard);

export default groupCard;
