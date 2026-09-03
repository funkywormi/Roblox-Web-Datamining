import groupSearchModule from '../groupSearchModule';

function groupsCarouselController() {
  'ngInject';

  const ctrl = this;

  ctrl.getCarouselElement = () => {
    return document.getElementsByClassName(ctrl.carouselId)[0];
  };

  ctrl.getCarouselElementInner = () => {
    return ctrl.getCarouselElement().getElementsByClassName('horizontally-scrollable')[0];
  };

  ctrl.getCarouselDimensions = () => {
    const el = ctrl.getCarouselElement();
    return el == null ? null : el.getBoundingClientRect();
  };

  ctrl.getCarouselInnerDimensions = () => {
    const el = ctrl.getCarouselElementInner();
    return el == null ? null : el.getBoundingClientRect();
  };

  ctrl.onScrollToPrev = () => {
    const carouselDimensions = ctrl.getCarouselDimensions();
    if (!carouselDimensions) {
      return;
    }

    const carouselWidth = carouselDimensions.width;

    const potentialScrollToOffset = ctrl.leftOffset + carouselWidth;
    const scrollToOffset = Math.min(potentialScrollToOffset, 0);

    ctrl.updateScrollParams(scrollToOffset);
  };

  ctrl.getScrollNextPosition = () => {
    const response = {
      scrollToOffset: 0,
      canScrollNext: false
    };

    const carouselDimensions = ctrl.getCarouselDimensions();
    if (!carouselDimensions) {
      return response;
    }

    const carouselInnerDimensions = ctrl.getCarouselInnerDimensions();

    const carouselWidth = carouselDimensions.width;
    const carouselInnerWidth = carouselInnerDimensions.width;

    if (carouselInnerWidth < carouselWidth) {
      return response;
    }

    const potentialScrollToOffset = ctrl.leftOffset - carouselWidth;
    const maxOffset = -(carouselInnerWidth - carouselWidth);
    const scrollToOffset = Math.max(potentialScrollToOffset, maxOffset);

    return {
      scrollToOffset,
      canScrollNext: ctrl.leftOffset > scrollToOffset
    };
  };

  ctrl.onScrollToNext = () => {
    const { scrollToOffset, canScrollNext } = ctrl.getScrollNextPosition();
    if (!canScrollNext) {
      return;
    }

    ctrl.updateScrollParams(scrollToOffset);
  };

  ctrl.updateScrollParams = leftOffset => {
    ctrl.leftOffset = leftOffset;
    ctrl.scrollerStyle = {
      left: `${ctrl.leftOffset}px`
    };
    ctrl.updateScrollArrows();
  };

  ctrl.handleResize = () => ctrl.updateScrollArrows();

  ctrl.updateScrollArrows = () => {
    const { canScrollNext } = ctrl.getScrollNextPosition();
    ctrl.layout.showNext = canScrollNext;
    ctrl.layout.showPrev = ctrl.leftOffset != 0;
  };

  /* Lifecycle functions */
  ctrl.$onInit = function () {
    ctrl.isResizeObserverSupported = typeof ResizeObserver !== 'undefined';
    ctrl.layout = {
      showPrev: false,
      showNext: true
    };
    window.addEventListener('resize', ctrl.handleResize);

    ctrl.updateScrollParams(0);
  };

  ctrl.$doCheck = function () {
    // UWP doesn't support ResizeObserver, update scroll arrows after content has loaded
    if (!ctrl.isResizeObserverSupported) {
      if (!ctrl.hasContentsLoaded && ctrl.getCarouselElement() && ctrl.getCarouselElementInner()) {
        const carouselInnerDimensions = ctrl.getCarouselInnerDimensions();
        const carouselInnerWidth = carouselInnerDimensions.width;

        if (carouselInnerWidth) {
          ctrl.updateScrollArrows();
          ctrl.hasContentsLoaded = true;
        }
      }

      return;
    }

    if (ctrl.resizeObserver || !ctrl.getCarouselElement() || !ctrl.getCarouselElementInner()) {
      return;
    }

    ctrl.resizeObserver = new ResizeObserver(ctrl.handleResize);
    ctrl.resizeObserver.observe(ctrl.getCarouselElementInner());
    ctrl.handleResize();
  };

  ctrl.$onDestroy = function () {
    window.removeEventListener('resize', ctrl.handleResize);
    if (ctrl.isResizeObserverSupported) {
      ctrl.resizeObserver?.disconnect();
    }
  };
}

groupSearchModule.controller('groupsCarouselController', groupsCarouselController);
export default groupsCarouselController;
