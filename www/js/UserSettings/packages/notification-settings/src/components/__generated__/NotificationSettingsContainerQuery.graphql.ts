/**
 * @generated SignedSource<<e6db64a378b8db799a9a493f37d5eeb7>>
 * @relayHash 403a847ab23ce4c2118ce2efec8eadad
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID nhYsNvySWtXVwJArCNk0KQ

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type NotificationSettingsContainerQuery$variables = {
  userId: string;
};
export type NotificationSettingsContainerQuery$data = {
  readonly userById: {
    readonly settings: {
      readonly notifications: {
        readonly " $fragmentSpreads": FragmentRefs<"NotificationCategoriesListFragment">;
      };
    } | null | undefined;
  } | null | undefined;
};
export type NotificationSettingsContainerQuery = {
  response: NotificationSettingsContainerQuery$data;
  variables: NotificationSettingsContainerQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "userId"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "userId",
    "variableName": "userId"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "value",
  "storageKey": null
},
v3 = [
  (v2/*: any*/)
],
v4 = {
  "alias": null,
  "args": null,
  "concreteType": "RequiredAction",
  "kind": "LinkedField",
  "name": "requiredActions",
  "plural": true,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "actionType",
      "storageKey": null
    }
  ],
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "concreteType": "PresentableValue",
  "kind": "LinkedField",
  "name": "setting",
  "plural": false,
  "selections": (v3/*: any*/),
  "storageKey": null
},
v6 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "SettingOption",
    "kind": "LinkedField",
    "name": "availableOptions",
    "plural": true,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "PresentableValue",
        "kind": "LinkedField",
        "name": "option",
        "plural": false,
        "selections": (v3/*: any*/),
        "storageKey": null
      },
      (v4/*: any*/)
    ],
    "storageKey": null
  },
  (v5/*: any*/),
  {
    "alias": null,
    "args": null,
    "concreteType": null,
    "kind": "LinkedField",
    "name": "selectedOption",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "__typename",
        "storageKey": null
      },
      (v2/*: any*/),
      {
        "kind": "InlineFragment",
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "enabled",
            "storageKey": null
          }
        ],
        "type": "BooleanSelection",
        "abstractKey": null
      }
    ],
    "storageKey": null
  }
],
v7 = {
  "alias": null,
  "args": null,
  "concreteType": "MultiOptionSetting",
  "kind": "LinkedField",
  "name": "preference",
  "plural": false,
  "selections": (v6/*: any*/),
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "concreteType": "PresentableValue",
  "kind": "LinkedField",
  "name": "channel",
  "plural": false,
  "selections": [
    (v2/*: any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "isLegallySensitive",
      "storageKey": null
    }
  ],
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "NotificationSettingsContainerQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "userById",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "UserSettings",
            "kind": "LinkedField",
            "name": "settings",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "NotificationSettings",
                "kind": "LinkedField",
                "name": "notifications",
                "plural": false,
                "selections": [
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "NotificationCategoriesListFragment"
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "NotificationSettingsContainerQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "userById",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "UserSettings",
            "kind": "LinkedField",
            "name": "settings",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "NotificationSettings",
                "kind": "LinkedField",
                "name": "notifications",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "NotificationCategory",
                    "kind": "LinkedField",
                    "name": "categories",
                    "plural": true,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "PresentableValue",
                        "kind": "LinkedField",
                        "name": "category",
                        "plural": false,
                        "selections": (v3/*: any*/),
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "NotificationType",
                        "kind": "LinkedField",
                        "name": "notificationTypes",
                        "plural": true,
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "PresentableValue",
                            "kind": "LinkedField",
                            "name": "notificationType",
                            "plural": false,
                            "selections": (v3/*: any*/),
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "NotificationChannel",
                            "kind": "LinkedField",
                            "name": "channels",
                            "plural": true,
                            "selections": [
                              (v7/*: any*/),
                              (v8/*: any*/)
                            ],
                            "storageKey": null
                          }
                        ],
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "NotificationChannel",
                    "kind": "LinkedField",
                    "name": "channels",
                    "plural": true,
                    "selections": [
                      (v8/*: any*/),
                      (v7/*: any*/)
                    ],
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "DoNotDisturbSettings",
                    "kind": "LinkedField",
                    "name": "doNotDisturb",
                    "plural": false,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "MultiOptionSetting",
                        "kind": "LinkedField",
                        "name": "enabled",
                        "plural": false,
                        "selections": (v6/*: any*/),
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "TimeWindowSetting",
                        "kind": "LinkedField",
                        "name": "timeWindow",
                        "plural": false,
                        "selections": [
                          (v5/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "TimeWindowValue",
                            "kind": "LinkedField",
                            "name": "value",
                            "plural": false,
                            "selections": [
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "startTimeMinutes",
                                "storageKey": null
                              },
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "endTimeMinutes",
                                "storageKey": null
                              }
                            ],
                            "storageKey": null
                          },
                          (v4/*: any*/)
                        ],
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "id": "nhYsNvySWtXVwJArCNk0KQ",
    "metadata": {},
    "name": "NotificationSettingsContainerQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "e29a6b891684d6eea935a49c92df44b7";

export default node;
