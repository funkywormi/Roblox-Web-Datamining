import recommendationsModule from '../recommendationsModule';

const carouselForAvatarPage = {
  options: {
    breakpoints: {
      479: {
        perView: 4.5
      },
      766: {
        perView: 4.5
      },
      1023: {
        perView: 4.5
      }
    }
  },

  breakpointWidth: [479, 766, 1023],

  glideControl: {
    defaultNumItemsToMove: 4.5,
    currentNumSlidesToMove: 4,
    currentPageNumber: 0,
    startAt: 0, // index
    disableLeftMove: false,
    disableRightMove: false
  }
};

recommendationsModule.constant('carouselForAvatarPage', carouselForAvatarPage);

export default carouselForAvatarPage;
