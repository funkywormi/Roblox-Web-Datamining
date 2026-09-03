import groupSearchModule from '../groupSearchModule';

const groupsCarousel = {
  templateUrl: 'groups-carousel',
  transclude: true,
  bindings: {
    carouselId: '<'
  },
  controller: 'groupsCarouselController'
};

groupSearchModule.component('groupsCarousel', groupsCarousel);

export default groupsCarousel;
