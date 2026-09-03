import groupModule from '../groupModule';

const groupReactExperiences = {
  templateUrl: 'group-react-experiences',
  bindings: {
    groupId: '<'
  }
};

groupModule.component('groupReactExperiences', groupReactExperiences);

export default groupReactExperiences;
