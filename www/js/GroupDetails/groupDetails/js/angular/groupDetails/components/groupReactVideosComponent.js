import groupModule from '../groupModule';

const groupReactVideos = {
    templateUrl: 'group-react-videos',
    bindings: {
        groupId: '<',
        videosData: '<'
    }
};

groupModule.component('groupReactVideos', groupReactVideos);
export default groupReactVideos;