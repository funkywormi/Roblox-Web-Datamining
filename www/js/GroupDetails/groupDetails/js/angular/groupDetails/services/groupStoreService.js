import groupModule from '../groupModule';

function groupStoreService(groupDetailsConstants, httpService, $filter) {
    "ngInject";

    return {
        getItemDetails: function (items) {
            var config = {
                url: $filter("formatString")(groupDetailsConstants.urls.catalogDetails)
            };
            var params = {
                items: items
            };
            return httpService.httpPost(config, params);
        }
    }
}

groupModule.factory("groupStoreService", groupStoreService);
export default groupStoreService;