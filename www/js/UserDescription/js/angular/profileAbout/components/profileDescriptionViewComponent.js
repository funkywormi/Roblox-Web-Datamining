import profileAboutModule from '../profileAboutModule';

const profileDescriptionView = {
  templateUrl: 'profile-description-view',
  bindings: {
    description: '<'
  },
  controller: 'profileDescriptionViewController'
};

profileAboutModule.component('profileDescriptionView', profileDescriptionView);

export default profileDescriptionView;
