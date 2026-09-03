import { GroupCoverPhotoService } from 'Roblox';
import groupModule from '../groupModule';

function groupReactCoverPhoto() {
  'ngInject';

  return {
    restrict: 'A',
    scope: {
      groupId: '<',
      coverPhotoData: '<'
    },
    link(scope, element) {
      const renderCoverPhoto = () => {
        const coverPhotoId = scope.coverPhotoData?.coverPhotoId;
        if (coverPhotoId) {
          GroupCoverPhotoService?.renderCoverPhoto(element[0], {
            groupId: scope.groupId,
            coverPhotoData: scope.coverPhotoData
          });
        }
      };

      element.ready(renderCoverPhoto);

      ['groupId', 'coverPhotoData'].forEach(prop => {
        scope.$watch(
          prop,
          (newVal, oldVal) => {
            if (JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
              renderCoverPhoto();
            }
          },
          true
        );
      });
    }
  };
}

groupModule.directive('groupReactCoverPhoto', groupReactCoverPhoto);

export default groupReactCoverPhoto;
