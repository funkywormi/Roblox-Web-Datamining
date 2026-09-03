import createGroupModule from '../createGroupModule';

function createGroupService($q, httpService, groupsConstants, createGroupConstants) {
  'ngInject';

  const whitespaceRegex = /^\s+$/;

  return {
    createGroup(
      name,
      description,
      groupIconFile,
      coverPhotoFile,
      isGroupPublic,
      isUploadingGroupIconEnabled
    ) {
      return $q(function (resolve, reject) {
        if (!name || whitespaceRegex.test(name)) {
          reject({ code: groupsConstants.errorCodes.internal.nameInvalid });
          return;
        }

        if (!groupIconFile && isUploadingGroupIconEnabled) {
          reject({ code: groupsConstants.errorCodes.internal.groupIconMissing });
          return;
        }

        return httpService
          .httpPost(
            {
              url: createGroupConstants.urls.createGroup,
              withFile: true
            },
            {
              icon: groupIconFile,
              coverPhoto: coverPhotoFile,
              name,
              description: description || '',
              publicGroup: isGroupPublic
            }
          )
          .then(
            function (responseJson) {
              resolve({
                id: responseJson.id
              });
            },
            function (result) {
              if (result.status === groupsConstants.statusCodes.payloadTooLarge) {
                reject(groupsConstants.errorCodes.internal.groupIconTooLarge);
              } else if (result.errors && result.errors.length > 0) {
                reject(result.errors[0]);
              } else {
                reject({ code: 0 });
              }
            }
          );
      });
    }
  };
}

createGroupModule.factory('createGroupService', createGroupService);

export default createGroupService;
