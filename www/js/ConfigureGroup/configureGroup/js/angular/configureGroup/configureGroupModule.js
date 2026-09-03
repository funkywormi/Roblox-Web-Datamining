import { TranslationResourceProvider } from 'Roblox';
import angular from 'angular';

const configureGroup = angular
  .module('configureGroup', [
    'robloxApp',
    'ui.bootstrap',
    'ui.router',
    'configureGroupTemplates',
    'groups',
    'cursorPagination',
    'modal',
    'thumbnails',
    'socialLinksConfiguration',
    'groupPayouts',
    'systemFeedback',
    'fileUpload',
    'infiniteScroll',
    'verticalMenu',
    'revenue',
    'searchDropdown'
  ])
  .config([
    '$stateProvider',
    '$urlRouterProvider',
    '$locationProvider',
    'languageResourceProvider',
    'configureGroupConstants',
    function (
      $stateProvider,
      $urlRouterProvider,
      $locationProvider,
      languageResourceProvider,
      configureGroupConstants
    ) {
      // validate url
      const loc = window.location.href;
      if (loc.indexOf('#') !== -1 && loc.indexOf('#!') === -1) {
        window.location.href = loc.replace('#', '#!');
      }
      // false mean hashband mode
      $locationProvider.html5Mode(false);
      $locationProvider.hashPrefix('!');
      $urlRouterProvider.otherwise('/information');

      // Handling menu selection
      angular.forEach(configureGroupConstants.menuOptions, function (menuOption) {
        $stateProvider.state(menuOption.name, {
          url: `/${menuOption.name}`,
          label: menuOption.displayName,
          authenticate: false,

          // Custom parameters
          menuOption,
          submenuOption: menuOption.submenuOptions[0]
        });

        angular.forEach(menuOption.submenuOptions, function (submenuOption) {
          $stateProvider.state(`${menuOption.name}/${submenuOption.name}`, {
            url: `/${menuOption.name}/${submenuOption.name}`,
            label: submenuOption.displayName,
            authenticate: false,

            // Custom parameters
            menuOption,
            submenuOption
          });
        });
      });

      const translationProvider = new TranslationResourceProvider();
      const featureGroupsResources = translationProvider.getTranslationResource('Feature.Groups');
      const authenticationTwoStepVerificationResources = translationProvider.getTranslationResource(
        'Authentication.TwoStepVerification'
      );
      languageResourceProvider.setTranslationResources([
        featureGroupsResources,
        authenticationTwoStepVerificationResources
      ]);
    }
  ]);

export default configureGroup;
