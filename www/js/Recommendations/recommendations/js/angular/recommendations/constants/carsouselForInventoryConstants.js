import recommendationsModule from '../recommendationsModule';

const carouselForInventory = {
  options: {
    breakpoints: {
      479: {
        perView: 2.5
      },
      766: {
        perView: 4.5
      },
      1023: {
        perView: 5.5
      }
    }
  },

  breakpointWidth: [479, 766, 1023],

  glideControl: {
    defaultNumItemsToMove: 5.5,
    currentNumSlidesToMove: 5,
    currentPageNumber: 0,
    startAt: 0, // index
    disableLeftMove: false,
    disableRightMove: false
  }
};

recommendationsModule.constant('carouselForInventory', carouselForInventory);

export default carouselForInventory;
