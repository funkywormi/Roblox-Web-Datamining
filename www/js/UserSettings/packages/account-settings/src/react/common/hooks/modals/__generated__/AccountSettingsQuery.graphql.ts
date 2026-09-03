/**
 * @generated SignedSource<<cd9400835c905e1483206f5ce645602a>>
 * @relayHash a1c02e6548ccf270ba9814c7a23e11b2
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID pI4yH8pYRe-ns_3r0y_FIA

import { ConcreteRequest } from 'relay-runtime';
export type AccountSettingsQuery$variables = {
  userId: string;
};
export type AccountSettingsQuery$data = {
  readonly userById: {
    readonly settings: {
      readonly notifications: {
        readonly promotionalOffers: {
          readonly channels: ReadonlyArray<{
            readonly channel: {
              readonly value: string;
            };
            readonly preference: {
              readonly selectedOption: {
                readonly enabled?: boolean;
                readonly value: string;
              } | null | undefined;
            };
          }>;
        } | null | undefined;
      };
    } | null | undefined;
  } | null | undefined;
};
export type AccountSettingsQuery = {
  response: AccountSettingsQuery$data;
  variables: AccountSettingsQuery$variables;
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
v2 = [
  {
    "kind": "Literal",
    "name": "key",
    "value": "PromotionalOffers"
  }
],
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "value",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "concreteType": "PresentableValue",
  "kind": "LinkedField",
  "name": "channel",
  "plural": false,
  "selections": [
    (v3/*: any*/)
  ],
  "storageKey": null
},
v5 = {
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
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "AccountSettingsQuery",
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
                    "alias": "promotionalOffers",
                    "args": (v2/*: any*/),
                    "concreteType": "NotificationType",
                    "kind": "LinkedField",
                    "name": "notificationType",
                    "plural": false,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "NotificationChannel",
                        "kind": "LinkedField",
                        "name": "channels",
                        "plural": true,
                        "selections": [
                          (v4/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "MultiOptionSetting",
                            "kind": "LinkedField",
                            "name": "preference",
                            "plural": false,
                            "selections": [
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": null,
                                "kind": "LinkedField",
                                "name": "selectedOption",
                                "plural": false,
                                "selections": [
                                  (v3/*: any*/),
                                  (v5/*: any*/)
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
                    "storageKey": "notificationType(key:\"PromotionalOffers\")"
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
    "name": "AccountSettingsQuery",
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
                    "alias": "promotionalOffers",
                    "args": (v2/*: any*/),
                    "concreteType": "NotificationType",
                    "kind": "LinkedField",
                    "name": "notificationType",
                    "plural": false,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "NotificationChannel",
                        "kind": "LinkedField",
                        "name": "channels",
                        "plural": true,
                        "selections": [
                          (v4/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "MultiOptionSetting",
                            "kind": "LinkedField",
                            "name": "preference",
                            "plural": false,
                            "selections": [
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
                                  (v3/*: any*/),
                                  (v5/*: any*/)
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
                    "storageKey": "notificationType(key:\"PromotionalOffers\")"
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
    "id": "pI4yH8pYRe-ns_3r0y_FIA",
    "metadata": {},
    "name": "AccountSettingsQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "816c10c8760ed643fdea336771500bd5";

export default node;
