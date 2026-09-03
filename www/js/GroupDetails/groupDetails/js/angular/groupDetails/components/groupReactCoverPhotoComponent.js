import groupModule from '../groupModule';

const groupReactCoverPhoto = {
  templateUrl: 'group-react-cover-photo',
  bindings: {
    groupId: '<',
    coverPhotoData: '<'
  }
};

groupModule.component('groupReactCoverPhoto', groupReactCoverPhoto);
export default groupReactCoverPhoto;
