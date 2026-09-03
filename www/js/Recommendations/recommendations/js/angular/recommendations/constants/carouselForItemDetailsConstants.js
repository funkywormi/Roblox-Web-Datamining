import recommendationsModule from '../recommendationsModule';

const carouselForItemDetails = {
  options: {
    breakpoints: {
      479: {
        perView: 2.5
      },
      766: {
        perView: 4.5
      },
      1023: {
        perView: 6.5
      }
    }
  },

  breakpointWidth: [479, 766, 1023],

  glideControl: {
    defaultNumItemsToMove: 6.5,
    currentNumSlidesToMove: 6,
    currentPageNumber: 0,
    startAt: 0, // index
    disableLeftMove: false,
    disableRightMove: false
  }
};

recommendationsModule.constant('carouselForItemDetails', carouselForItemDetails);

export default carouselForItemDetails;
