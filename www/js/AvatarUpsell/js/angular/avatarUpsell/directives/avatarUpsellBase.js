import avatarUpsellModule from '../avatarUpsellModule';

function avatarUpsellBase() {
  return {
    restrict: 'A',
    replace: false,
    templateUrl: 'avatar-upsell'
  };
}

avatarUpsellModule.directive('avatarUpsellBase', avatarUpsellBase);

export default avatarUpsellBase;
