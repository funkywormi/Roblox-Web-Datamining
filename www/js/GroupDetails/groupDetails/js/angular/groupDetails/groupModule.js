import { TranslationResourceProvider, CommunityUserActivityTracker } from 'Roblox';
import angular from 'angular';

const group = angular
  .module('group', [
    'robloxApp',
    'groupDetailsHtmlTemplateApp',
    'groups',
    'ui.bootstrap',
    'cursorPagination',
    'ui.router',
    'modal',
    'socialLinksJumbotron',
    'thumbnails',
    'captchaV2',
    'groupPayouts',
    'groupList',
    'systemFeedback',
    'infiniteScroll',
    'presence',
    'searchDropdown'
  ])
  .config([
    '$stateProvider',
    '$urlRouterProvider',
    '$locationProvider',
    'languageResourceProvider',
    function ($stateProvider, $urlRouterProvider, $locationProvider, languageResourceProvider) {
      // validate url
      const loc = window.location.href;
      if (loc.indexOf('#') !== -1 && loc.indexOf('#!') === -1) {
        window.location.href = loc.replace('#', '#!');
      }
      // false mean hashband mode
      $locationProvider.html5Mode(false);
      $locationProvider.hashPrefix('!');
      $urlRouterProvider.otherwise('/about');
      $stateProvider
        .state('about', {
          url: '/about',
          label: 'About',
          authenticate: false
        })
        .state('store', {
          url: '/store',
          label: 'Store',
          authenticate: false
        })
        .state('affiliates', {
          url: '/affiliates',
          label: 'Affiliates',
          authenticate: false
        })
        .state('events', {
          url: '/events',
          label: 'Events',
          authenticate: false
        })
        .state('forums', {
          url: '/forums',
          label: 'Forums',
          authenticate: false
        })
        .state('forums.category', {
          url: '/:categoryId',
          label: 'Forums',
          authenticate: false
        })
        .state('forums.category.createPost', {
          url: '/post/create',
          label: 'Forums',
          authenticate: false
        })
        .state('forums.category.post', {
          url: '/post/:postId',
          label: 'Forums',
          authenticate: false
        })
        .state('forums.category.post.edit', {
          url: '/edit',
          label: 'Forums',
          authenticate: false
        })
        .state('forums.category.post.comment', {
          url: '/comment/:commentId',
          label: 'Forums',
          authenticate: false
        });

      const translationProvider = new TranslationResourceProvider();

      // https://sourcegraph.rbx.com/github.rbx.com/Roblox/web-platform/-/blob/Assemblies/TranslationResources/Roblox.TranslationResources/ResourceFactories/Feature/GroupsResourceFactory.cs?L13
      const groupResources = translationProvider.getTranslationResource('Feature.Groups');

      // https://sourcegraph.rbx.com/github.rbx.com/Roblox/web-platform/-/blob/Assemblies/TranslationResources/Roblox.TranslationResources/ResourceFactories/CreatorDashboard/ControlsResourceFactory.cs?L13
      const controlResources = translationProvider.getTranslationResource(
        'CreatorDashboard.Controls'
      );

      // https://sourcegraph.rbx.com/github.rbx.com/Roblox/web-platform/-/blob/Assemblies/TranslationResources/Roblox.TranslationResources/ResourceFactories/Authentication/TwoStepVerificationResourceFactory.cs?L13
      const twoStepVerificationResources = translationProvider.getTranslationResource(
        'Authentication.TwoStepVerification'
      );

      CommunityUserActivityTracker.initialize();

      languageResourceProvider.setTranslationResources([
        groupResources,
        controlResources,
        twoStepVerificationResources
      ]);
    }
  ]);

export default group;
