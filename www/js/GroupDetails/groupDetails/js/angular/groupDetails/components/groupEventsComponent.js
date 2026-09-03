import groupModule from '../groupModule';

const groupEvents = {
  templateUrl: 'group-events',
  bindings: {
    onlyShowFeaturedEvent: '<',
    group: '<',
    canSetFeaturedEvent: '<'
  },
  controller: 'groupEventsController'
};

groupModule.component('groupEvents', groupEvents);
export default groupEvents;
