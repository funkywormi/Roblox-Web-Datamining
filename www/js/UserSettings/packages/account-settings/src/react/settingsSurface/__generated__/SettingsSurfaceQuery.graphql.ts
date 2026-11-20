/**
 * @generated SignedSource<<c2686c336c7c57842cd935e0271183fd>>
 * @relayHash 5e4f6578bd7e6a8fe16494940d967dca
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID QSl7x0zXCKFmpg_Dx5l83A

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type SettingsSurfaceKey = "ManageRecommendationsPage" | "ManageRecommendationsParentPage" | "%future added value";
export type SettingsSurfaceQuery$variables = {
  surface: SettingsSurfaceKey;
  userId: string;
};
export type SettingsSurfaceQuery$data = {
  readonly userById: {
    readonly id: string;
    readonly settings: {
      readonly surface: {
        readonly " $fragmentSpreads": FragmentRefs<"SettingsSurfaceFragment">;
      } | null | undefined;
    } | null | undefined;
  } | null | undefined;
};
export type SettingsSurfaceQuery = {
  response: SettingsSurfaceQuery$data;
  variables: SettingsSurfaceQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "surface"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "userId"
},
v2 = [
  {
    "kind": "Variable",
    "name": "userId",
    "variableName": "userId"
  }
],
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v4 = [
  {
    "kind": "Variable",
    "name": "key",
    "variableName": "surface"
  }
],
v5 = {
  "alias": null,
  "args": null,
  "concreteType": "DisplayText",
  "kind": "LinkedField",
  "name": "presentation",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "label",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "FormattedText",
      "kind": "LinkedField",
      "name": "description",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "text",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "concreteType": "TextLink",
          "kind": "LinkedField",
          "name": "links",
          "plural": true,
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "opening",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "closing",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "url",
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
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "value",
  "storageKey": null
},
v7 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "PresentableValue",
    "kind": "LinkedField",
    "name": "option",
    "plural": false,
    "selections": [
      (v6/*: any*/)
    ],
    "storageKey": null
  },
  {
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
  }
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "SettingsSurfaceQuery",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "userById",
        "plural": false,
        "selections": [
          (v3/*: any*/),
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
                "args": (v4/*: any*/),
                "concreteType": "SettingsSurface",
                "kind": "LinkedField",
                "name": "surface",
                "plural": false,
                "selections": [
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "SettingsSurfaceFragment"
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
    "argumentDefinitions": [
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "SettingsSurfaceQuery",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "userById",
        "plural": false,
        "selections": [
          (v3/*: any*/),
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
                "args": (v4/*: any*/),
                "concreteType": "SettingsSurface",
                "kind": "LinkedField",
                "name": "surface",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "PresentableValue",
                    "kind": "LinkedField",
                    "name": "header",
                    "plural": false,
                    "selections": [
                      (v5/*: any*/)
                    ],
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": null,
                    "kind": "LinkedField",
                    "name": "settings",
                    "plural": true,
                    "selections": [
                      (v3/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "__typename",
                        "storageKey": null
                      },
                      {
                        "kind": "TypeDiscriminator",
                        "abstractKey": "__isUserSetting"
                      },
                      {
                        "kind": "InlineFragment",
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "PresentableValue",
                            "kind": "LinkedField",
                            "name": "setting",
                            "plural": false,
                            "selections": [
                              (v6/*: any*/),
                              (v5/*: any*/)
                            ],
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "enabled",
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "SettingOption",
                            "kind": "LinkedField",
                            "name": "on",
                            "plural": false,
                            "selections": (v7/*: any*/),
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "SettingOption",
                            "kind": "LinkedField",
                            "name": "off",
                            "plural": false,
                            "selections": (v7/*: any*/),
                            "storageKey": null
                          }
                        ],
                        "type": "BooleanSetting",
                        "abstractKey": null
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
        "storageKey": null
      }
    ]
  },
  "params": {
    "id": "QSl7x0zXCKFmpg_Dx5l83A",
    "metadata": {},
    "name": "SettingsSurfaceQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "1e220e916b1afd963618aaaea23ee53e";

export default node;
