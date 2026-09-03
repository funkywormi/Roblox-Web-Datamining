import groupModule from "../groupModule";

const groupAffiliates = {
    templateUrl: "group-affiliates",
    bindings: {
        "groupId": "<",
        "sectionTitle": "<",
        "noAffiliatesMessage": "<",
        "relationshipType": "<"
    },
    controller: "groupAffiliatesController"
};

groupModule.component("groupAffiliates", groupAffiliates);

export default groupAffiliates;