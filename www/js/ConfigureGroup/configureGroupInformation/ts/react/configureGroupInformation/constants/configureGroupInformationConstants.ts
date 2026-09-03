import { EnvironmentUrls } from 'Roblox';

export default {
  urls: {
    updateGroupDescriptionUrl: `${EnvironmentUrls.groupsApi}/v1/groups/{groupId}/description`,
    updateGroupNameUrl: `${EnvironmentUrls.groupsApi}/v1/groups/{groupId}/name`,
    updateGroupIconUrl: `${EnvironmentUrls.groupsApi}/v1/groups/icon?groupId={groupId}`,
    updateGroupCoverPhotoUrl: `${EnvironmentUrls.groupsApi}/v1/groups/cover-photo?groupId={groupId}`
  },

  translationKeys: {
    coverPhoto: {
      text: {
        sectionTitle: 'Label.CreateGroupCoverPhoto',
        description: 'Description.UpdateGroupCoverPhoto',
        saveButton: 'Action.Save',
        deleteButton: 'Action.Delete'
      },
      success: {
        fileUpdateSuccess: 'Message.GroupCoverPhotoUpdateSuccess',
        fileDeleteSuccess: 'Message.GroupCoverPhotoDeleteSuccess'
      },
      errors: {
        fileMissing: 'Message.GroupCoverPhotoMissing',
        fileInvalid: 'Message.GroupCoverPhotoInvalid',
        fileTooLarge: 'Message.GroupCoverPhotoTooLarge',
        fileUpdateFail: 'Message.GroupCoverPhotoUpdateFail',
        fileDeleteFail: 'Message.GroupCoverPhotoDeleteFail',
        tooManyRequests: 'Message.TooManyRequests',
        unknown: 'Message.UnknownError'
      }
    },

    emblem: {
      text: {
        sectionTitle: 'Label.CreateGroupEmblem',
        saveButton: 'Action.Save'
      },
      success: {
        fileUpdateSuccess: 'Message.GroupIconUpdateSuccess'
      },
      errors: {
        fileMissing: 'Message.GroupIconInvalid',
        fileInvalid: 'Message.GroupIconInvalid',
        fileTooLarge: 'Message.GroupIconTooLarge',
        fileUpdateFail: 'Message.GroupIconUpdateFail',
        tooManyRequests: 'Message.TooManyRequests',
        unknown: 'Message.UnknownError'
      }
    }
  }
};
