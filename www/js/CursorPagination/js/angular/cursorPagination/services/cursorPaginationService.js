import cursorPaginationModule from "../cursorPaginationModule";

function cursorPaginationService($q, $rootScope, httpService, cacheService) {
    "ngInject";
    var defaultLimitName = "limit";
    var defaultCursorName = "cursor";
    var defaultSortOrderName = "sortOrder";

    var busyPromise = $q.defer();
    busyPromise.reject([{
        code: -1,
        message: "Busy"
    }]);


    return {
        getDataListFromResponseMethods: {
            defaultV1: function (response) {
                return $q(function (resolve, reject) {
                    resolve(response.data);
                });
            }
        },

        getNextPageCursorFromResponseMethods: {
            defaultV1: function (data) {
                return data.nextPageCursor;
            }
        },

        getErrorsFromResponseMethods: {
            defaultV1: function (data) {
                return data.errors;
            }
        },

        getQueryParametersMethods: {
            defaultV1: function (params) {
                return params;
            }
        },

        sortOrder: {
            Asc: "Asc",
            Desc: "Desc"
        },

        /*
            options {
                getDataListFromResponse: function(response) // should return a $q promise that resolves to an array of items from response [optional: default to getDataListFromResponseMethods.defaultV1]
                getNextPageCursorFromResponse: function(response) // should return cursor string for next page of results [optional: defaults to getNextPageCursorFromResponseMethods.defaultV1]
                getErrorsFromResponse: function(response) // should return an array of errors in the API standard response format {code:000,message:"..."} [optional: defaults to the getErrorsFromResponseMethods.defaultV1]
                getQueryParameters: function(pagingParameters) // should return an object of query string parameters [optional: defaults to getQueryParametersMethods.defaultV1]
                getRequestUrl: function(pagingParameters) // should return the url used to load the page of results [required]
                getCacheKeyParameters: function(pagingParameters) // should return parameters used to build a cache key for results [required]

                beforeLoad: function(pageNumber, pageParameters) // when specified fires before http request (does not fire if page is cached) [optional]
                loadSuccess: function(items) // when passed will fire when a page is requested, and loaded (either from the cache, or http request) [optional]
                loadError: function(errors) // when passed will fire when an http request fails to load a page (does not fire if page is cached) [optional]

                limitName: "..." // should be the name of the items per page request parameter (e.g. "itemsPerPage", e.g. "limit") [defaults to defaultLimitName]
                cursorName: "..." // should be the name of the cursor request parameter (e.g. "cursor") [defaults to defaultCursorName]
                sortOrderName: "..." // should be the name of the sort order request parameter (e.g. "sortOrder") [defaults to defaultSortOrderName]
                sortOrder: "Asc" // should be the default sort order of the paged request, options included in cursorPaginationService.sortOrder [defaults to cursorPaginationService.sortOrder.Asc]
                firstPageCursor: "", // the cursor for the first page (e.g. "0") [defaults to empty string]

                pageSize: 000 // this should be the number of items each page should have [required] (cannot be larger than loadPageSize)
                loadPageSize: 000 // how many results should be loaded at once to fill these pages [required, must be higher than pageSize] (be careful: Allowed values: 10, 25, 50, 100 only)
            }
            
            bool canReloadCurrentPage() // whether or not the pager can reload the current page of items after the cache was updated (returns hasCurrentPage result)
            bool hasCurrentPage() // will return false if there are no elements available for the current page and it's not the first page, true otherwise

            returns {
                bool isBusy: function() // whether or not the pager is currently loading something

                void setPagingParameter(string key, any value) // sets a paging parameter, if value is undefined or null will delete the paging parameter
                any getPagingParameter(string key) // returns the paging parameter with the key 'key'

                int getCurrentPageNumber() // gets the current page number

                bool removeItemAtIndex(int index) // removes the item at the specified index and reloads page
                bool loadNextPage() // loads the next page of items (returns canLoadNextPage result)
                bool loadPreviousPage() // loads the previous page of items (returns canLoadPreviousPage result)
                bool loadFirstPage() // clears the cache, then loads the first page of items (returns canLoadFirstPage result)

                bool canRemoveItem() // whether or not the pager can remove an item (will return false if it's busy)
                bool canLoadNextPage() // whether or not the pager can load the next page of items (will return false if it's busy or there is no next page)
                bool canLoadPreviousPage() // whether or not the pager can load the previous page of items (will be false if it's busy or there is no previous page)
                bool canLoadFirstPage() // whether or not the pager can load the first page of items (will return false if it's busy)
                bool hasNextPage() // whether or not the pager has reached the end of the pages of items (will return false if it has)

                this beforeLoad(function callBack(event, int pageNumber, object pageParameters)) // adds an event listener with callBack for when a page is about to be loaded
                this pageLoaded(function callBack(event, int pageNumber, array dataList, object response)) // adds an event listener with callBack for when a page is successfully loaded
                this loadError(function callBack(event, array errors)) // adds an event listener with callBack for when a page fails to load
            }
        */
        createPager: function (options) {
            var currentPageNumber = 0;
            var debounce = false;
            var pageParameters = {};
            var nextPageCursors = {};
            var cache = cacheService.createPaginationCache(options.pageSize);
            var firstPageCursor = typeof (options.firstPageCursor) === "string" ? options.firstPageCursor : "";

            options.limitName = options.limitName || defaultLimitName;
            options.cursorName = options.cursorName || defaultCursorName;
            options.sortOrderName = options.sortOrderName || defaultSortOrderName;
            options.sortOrder = options.sortOrder || this.sortOrder.Asc;

            pageParameters[options.cursorName] = firstPageCursor;
            pageParameters[options.sortOrderName] = options.sortOrder;
            pageParameters[options.limitName] = options.loadPageSize;
            options.getDataListFromResponse = options.getDataListFromResponse || this.getDataListFromResponseMethods.defaultV1;
            options.getNextPageCursorFromResponse = options.getNextPageCursorFromResponse || this.getNextPageCursorFromResponseMethods.defaultV1;
            options.getErrorsFromResponse = options.getErrorsFromResponse || this.getErrorsFromResponseMethods.defaultV1;
            options.getQueryParameters = options.getQueryParameters || this.getQueryParametersMethods.defaultV1;
            options.loadSuccess = options.loadSuccess || function () { };
            options.loadError = options.loadError || function () { };


            function getCacheKey() {
                return cacheService.buildKey(options.getCacheKeyParameters(pageParameters));
            }

            function loadPage(pageNumber) {
                var cacheKey = getCacheKey();
                var items = cache.getPage(cacheKey, pageNumber);
                var deferred = $q.defer();

                deferred.promise.then(options.loadSuccess, options.loadError);
                if (items.length === options.pageSize || typeof (nextPageCursors[cacheKey]) !== "string") {
                    currentPageNumber = pageNumber;
                    deferred.resolve(items);
                    return deferred.promise;
                }

                pageParameters[options.cursorName] = nextPageCursors[cacheKey];
                if (options.beforeLoad) {
                    options.beforeLoad(pageNumber, pageParameters);
                }

                debounce = true;
                var urlConfig = {
                    url: options.getRequestUrl(pageParameters)
                }
                var params = options.getQueryParameters(pageParameters);
                httpService.httpGet(urlConfig, params).then(function (data) {
                    currentPageNumber = pageNumber;
                    nextPageCursors[cacheKey] = options.getNextPageCursorFromResponse(data);
                    options.getDataListFromResponse(data).then(function (list) {
                        if (Array.isArray(list)) {
                            cache.append(cacheKey, list);
                            items = cache.getPage(cacheKey, pageNumber);
                            debounce = false;
                            deferred.resolve(items);
                        } else {
                            debounce = false;
                            deferred.reject([{
                                code: 0,
                                message: "data pulled from response not array"
                            }]);
                        }
                    }, function () {
                        debounce = false;
                        deferred.reject();
                    });
                }, function (data) {
                    debounce = false;
                    deferred.reject(options.getErrorsFromResponse(data || {}));
                });

                return deferred.promise;
            }

            function canReloadCurrentPage() {
                return hasCurrentPage();
            }

            function hasCurrentPage() {
                var cacheKey = getCacheKey();

                // If it's the first page, we can reload it regardless of cache size
                if (currentPageNumber === 1) {
                    return true;
                }

                // Otherwise, make sure we have enough in the cache
                return cache.getLength(cacheKey) > (currentPageNumber - 1) * options.pageSize;
            }


            return {
                isBusy: function () {
                    return debounce;
                },

                setPagingParameter: function (key, value) {
                    if (value === undefined || value === null) {
                        delete pageParameters[key];
                    } else {
                        pageParameters[key] = value;
                    }
                },

                getPagingParameter: function (key) {
                    return pageParameters[key];
                },

                getCurrentPageNumber: function () {
                    return currentPageNumber;
                },

                removeCurrentPage: function () {
                    // Removes the elements on the current page and reloads
                    if (!this.canRemoveItem()) {
                        return busyPromise.promise;
                    }

                    var cacheKey = getCacheKey();
                    cache.removePage(cacheKey, currentPageNumber);

                    if (canReloadCurrentPage()) {
                        return loadPage(currentPageNumber);
                    }

                    // Otherwise, load previous page
                    return loadPage(currentPageNumber - 1);
                },

                removeItemAtIndex: function (index) {
                    // Removes an element at the specified index from the cache
                    // and reloads the current page
                    if (!this.canRemoveItem()) {
                        return busyPromise.promise;
                    }

                    var cacheKey = getCacheKey();
                    cache.removeAtIndex(cacheKey, currentPageNumber, index);

                    if (canReloadCurrentPage()) {
                        return loadPage(currentPageNumber);
                    }

                    // Otherwise, load previous page
                    return loadPage(currentPageNumber - 1);
                },

                loadNextPage: function () {
                    if (!this.canLoadNextPage()) {
                        return busyPromise.promise;
                    }
                    return loadPage(currentPageNumber + 1);
                },

                loadPreviousPage: function () {
                    if (!this.canLoadPreviousPage()) {
                        return busyPromise.promise;
                    }
                    return loadPage(currentPageNumber - 1);
                },

                loadFirstPage: function () {
                    if (!this.canLoadFirstPage()) {
                        return busyPromise.promise;
                    }
                    // When loading the first page clear the cache, assume we're starting over.
                    var cacheKey = getCacheKey();
                    cache.clear(cacheKey);
                    nextPageCursors[cacheKey] = firstPageCursor;
                    return loadPage(1);
                },

                canRemoveItem: function () {
                    return !this.isBusy();
                },

                canLoadNextPage: function () {
                    if (this.isBusy()) {
                        return false;
                    }
                    return this.hasNextPage();
                },

                hasNextPage: function () {
                    var cacheKey = getCacheKey();
                    if (cache.getLength(cacheKey) > currentPageNumber * options.pageSize) {
                        // If we have enough in the cache we're good to load the next page
                        return true;
                    }
                    // The cursor for the next page must be defined as a string before we can load the next page with it.
                    return typeof (nextPageCursors[cacheKey]) === "string";
                },

                canLoadPreviousPage: function () {
                    return !this.isBusy() && currentPageNumber > 1;
                },

                canLoadFirstPage: function () {
                    return !this.isBusy();
                }
            };
        }
    };
}

cursorPaginationModule.service("cursorPaginationService", cursorPaginationService);

export default cursorPaginationService;
