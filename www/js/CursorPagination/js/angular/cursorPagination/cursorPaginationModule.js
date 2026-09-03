import angular from 'angular';
import { TranslationResourceProvider } from 'Roblox';

let cursorPagination = angular.module("cursorPagination", ["cursorPaginationHtmlTemplate"])
    .config(['$qProvider', 'languageResourceProvider', function ($qProvider, languageResourceProvider) {
        /**
            * This here for mask error coming from Angular 1.6.3 upgrade
            * http://stackoverflow.com/questions/41281515/possibly-unhandled-rejection-in-angular-1-6/41283198#41283198
            */
        if (angular.isFunction($qProvider.errorOnUnhandledRejections)) {
            $qProvider.errorOnUnhandledRejections(false);
        }
        const translationProvider = new TranslationResourceProvider();
        const commonUIControlsResources = translationProvider.getTranslationResource('CommonUI.Controls');
        languageResourceProvider.setTranslationResources([commonUIControlsResources]);
    }]);

export default cursorPagination;