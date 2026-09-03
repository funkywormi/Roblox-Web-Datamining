import groupModule from '../groupModule';

const groupPublicServers = {
  templateUrl: 'group-public-servers',
  bindings: {
    groupId: '<'
  },
  controller: 'groupPublicServersController'
};

groupModule.component('groupPublicServers', groupPublicServers);

export default groupPublicServers;
