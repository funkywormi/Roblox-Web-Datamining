import itemDetailsModule from '../itemDetailsModule';

const itemDetailsComponent = {
  templateUrl: 'item-details',
  bindings: {},
  controller: 'itemDetailsController'
};

itemDetailsModule.component('itemDetails', itemDetailsComponent);
export default itemDetailsComponent;
