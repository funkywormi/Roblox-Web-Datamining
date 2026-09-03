import { CursorPager } from "core-utilities";
import cursorPaginationModule from "../cursorPaginationModule";

// Angular wrapper for cursorPaginationService
function cursorPaginationServiceV2($q) {
    "ngInject";

    const wrapPromise = function (promise) {
        return $q(function (resolve, reject) {
            promise.then(resolve).catch(reject);
        });
    };

    return {
        createPager: function (options) {
            var pager = new CursorPager(options.pageSize, options.loadPageSize, options.getItems);

            return {
                getStatus: function () {
                    return pager.status;
                },

                isBusy: function () {
                    return pager.isBusy;
                },

                setPagingParametersAndLoadFirstPage: function (newPagingParameters) {
                    return wrapPromise(pager.setPagingParametersAndLoadFirstPage(newPagingParameters));
                },

                getPagingParameters: function () {
                    return pager.pagingParameters;
                },

                getCurrentPageNumber: function () {
                    return pager.currentPageNumber;
                },

                reloadCurrentPage: function () {
                    return wrapPromise(pager.reloadCurrentPage());
                },

                getCurrentPage: function () {
                    return wrapPromise(pager.getCurrentPage());
                },

                loadNextPage: function () {
                    return wrapPromise(pager.loadNextPage());
                },

                loadPreviousPage: function () {
                    return wrapPromise(pager.loadPreviousPage());
                },

                loadFirstPage: function () {
                    return wrapPromise(pager.loadFirstPage());
                },

                hasNextPage: function () {
                    return pager.hasNextPage;
                },

                canLoadNextPage: function () {
                    return pager.canLoadNextPage;
                },

                canLoadPreviousPage: function () {
                    return pager.canLoadPreviousPage;
                },

                canLoadFirstPage: function () {
                    return pager.canLoadFirstPage;
                },

                canReloadCurrentPage: function () {
                    return pager.canReloadCurrentPage;
                }
            };
        }
    };
}

cursorPaginationModule.service("cursorPaginationServiceV2", cursorPaginationServiceV2);
export default cursorPaginationServiceV2;
