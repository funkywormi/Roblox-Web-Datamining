import configureGroupModule from '../configureGroupModule';

function configureGroupAffiliatesService(httpService, configureGroupConstants, $filter) {
    "ngInject";

    function affiliateRequestUrl(groupId, relationshipType, relatedGroupId) {
        return $filter("formatString")(configureGroupConstants.urls.groupAffiliateRequestUrl,
            {
                groupId: groupId,
                groupRelationshipType: relationshipType,
                relatedGroupId: relatedGroupId
            });
    };

    function affiliateRequestsUrl(groupId, relationshipType) {
        return $filter("formatString")(configureGroupConstants.urls.groupAffiliateRequestsUrl,
            {
                groupId: groupId,
                groupRelationshipType: relationshipType
            });
    };

    function groupRelationshipUrl(groupId, relationshipType, relatedGroupId) {
        return $filter("formatString")(configureGroupConstants.urls.groupRelationshipUrl,
            {
                groupId: groupId,
                groupRelationshipType: relationshipType,
                relatedGroupId: relatedGroupId
            });
    };

    return {
        createGroupRelationship: function (groupId, relationshipType, relatedGroupId) {
            var config = {
                url: groupRelationshipUrl(groupId, relationshipType, relatedGroupId)
            };

            return httpService.httpPost(config);
        },

        deleteGroupRelationship: function (groupId, relationshipType, relatedGroupId) {
            var config = {
                url: groupRelationshipUrl(groupId, relationshipType, relatedGroupId)
            };

            return httpService.httpDelete(config);
        },

        acceptAffiliateRequests: function (groupId, relationshipType, groupIds) {
            var config = {
                url: affiliateRequestsUrl(groupId, relationshipType)
            };

            var params = {
                groupIds: groupIds
            };

            return httpService.httpPost(config, params);
        },

        ignoreAffiliateRequests: function (groupId, relationshipType, groupIds) {
            var config = {
                url: affiliateRequestsUrl(groupId, relationshipType),
                headers: {
                    "Content-Type": "application/json"
                }
            };

            var params = {
                groupIds: groupIds
            };

            return httpService.httpDelete(config, params);
        },

        acceptAffiliateRequest: function (groupId, relationshipType, relatedGroupId) {
            var config = {
                url: affiliateRequestUrl(groupId, relationshipType, relatedGroupId)
            };

            return httpService.httpPost(config);
        },

        declineAffiliateRequest: function (groupId, relationshipType, relatedGroupId) {
            var config = {
                url: affiliateRequestUrl(groupId, relationshipType, relatedGroupId)
            };

            return httpService.httpDelete(config);
        }
    }
}

configureGroupModule.factory("configureGroupAffiliatesService", configureGroupAffiliatesService);

export default configureGroupAffiliatesService;
