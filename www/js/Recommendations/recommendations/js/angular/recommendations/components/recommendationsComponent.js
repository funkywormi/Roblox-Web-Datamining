import recommendationsModule from '../recommendationsModule';

const recommendationsComponent = {
  templateUrl: 'recommendations',
  bindings: {
    recommendationTargetId: '<?',
    recommendationType: '<',
    recommendationSubtype: '<?',
    recommendationItemtypes: '<?',
    itemCreator: '<?',
    pageName: '@',
    showSeeAllButton: '<?'
  },
  controller: 'recommendationsController'
};

recommendationsModule.component('recommendations', recommendationsComponent);
export default recommendationsComponent;
