import { CurrentUser, EnvironmentUrls, DeviceMeta } from 'Roblox';
import avatarUpsellModule from '../avatarUpsellModule';

function avatarUpsellController(
  $scope,
  $log,
  avatarUpsellConstants,
  $timeout,
  $window,
  thumbnailService
) {
  'ngInject';

  $log.debug('avatarUpsellController starting');
  $scope.buildDownloadLink = function() {
    // default to protocol URL
    const deviceInfo = DeviceMeta();
    const { appProtocolUrl, iosAppStoreLink, googlePlayStoreLink } = EnvironmentUrls;
    let downloadLink = appProtocolUrl;
    $scope.layout.linkToFollow = appProtocolUrl;
    if (deviceInfo) {
      if (deviceInfo.isIosDevice) {
        downloadLink = iosAppStoreLink;
      } else if (deviceInfo.isAndroidDevice) {
        downloadLink = googlePlayStoreLink;
      }
    }
    $scope.layout.downloadLink = downloadLink;
  };

  $scope.launchApp = function() {
    $timeout(function() {
      if ($window.document.hasFocus && $window.document.hasFocus()) {
        $window.location.href = $scope.layout.downloadLink;
      }
    }, avatarUpsellConstants.layout.waitBeforeNavigatingToStore);
  };

  $scope.getAvatarThumbnail = function() {
    const currentUserId = parseInt(CurrentUser.userId);
    const { thumbnailType, avatarSize } = avatarUpsellConstants;
    thumbnailService
      .getThumbnailImage(thumbnailType, currentUserId, avatarSize)
      .then(function(image) {
        $scope.dataModel.thumbUrl = image.thumbnail.imageUrl;
      });
  };

  $scope.init = function() {
    $scope.layout = avatarUpsellConstants.layout;
    $scope.dataModel = {
      userId: CurrentUser.userId,
      userName: CurrentUser.name
    };
    $scope.getAvatarThumbnail();
    $scope.buildDownloadLink();
  };

  $scope.init();
}

avatarUpsellModule.controller('avatarUpsellController', avatarUpsellController);

export default avatarUpsellController;
