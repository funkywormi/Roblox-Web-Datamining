import configureGroupModule from '../configureGroupModule';

const groupBanner = {
  templateUrl: 'group-banner',
  bindings: {
    title: '<',
    content: '<',
    buttonText: '<',
    onClickButton: '<',
    isDismissedLocalStorageKey: '<'
  },
  controller: 'groupBannerController'
};

configureGroupModule.component('groupBanner', groupBanner);
export default groupBanner;
