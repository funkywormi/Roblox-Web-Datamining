/**
 * @generated SignedSource<<5545f7b2161a193f884046e4a8804802>>
 * @relayHash 52d0f0e9b80b9dc149e2f2322518d680
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 528EVmtst-oJbFHbns6wEw

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type UpdateUserSettingInput = {
  name: string;
  value: UserSettingValueInput;
};
export type UserSettingValueInput = {
  option?: string | null | undefined;
};
export type UpdateUserSettingMutation$variables = {
  input: UpdateUserSettingInput;
  userId: string;
};
export type UpdateUserSettingMutation$data = {
  readonly updateUserSetting: {
    readonly __typename: "UserSettingUpdateRejected";
    readonly setting: {
      readonly " $fragmentSpreads": FragmentRefs<"SettingsSurfaceRowFragment">;
    } | null | undefined;
  } | {
    readonly __typename: "UserSettingUpdated";
    readonly settings: ReadonlyArray<{
      readonly " $fragmentSpreads": FragmentRefs<"SettingsSurfaceRowFragment">;
    } | null | undefined>;
  } | {
    // This will never be '%other', but we need some
    // value in case none of the concrete values match.
    readonly __typename: "%other";
  } | null | undefined;
};
export type UpdateUserSettingMutation = {
  response: UpdateUserSettingMutation$data;
  variables: UpdateUserSettingMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "input"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "userId"
},
v2 = [
  {
    "kind": "Variable",
    "name": "input",
    "variableName": "input"
  },
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
  "name": "__typename",
  "storageKey": null
},
v4 = [
  {
    "args": null,
    "kind": "FragmentSpread",
    "name": "SettingsSurfaceRowFragment"
  }
],
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "value",
  "storageKey": null
},
v6 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "PresentableValue",
    "kind": "LinkedField",
    "name": "option",
    "plural": false,
    "selections": [
      (v5/*: any*/)
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
],
v7 = [
  (v3/*: any*/),
  {
    "kind": "TypeDiscriminator",
    "abstractKey": "__isUserSetting"
  },
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "id",
    "storageKey": null
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
          (v5/*: any*/),
          {
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
          }
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
        "selections": (v6/*: any*/),
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "SettingOption",
        "kind": "LinkedField",
        "name": "off",
        "plural": false,
        "selections": (v6/*: any*/),
        "storageKey": null
      }
    ],
    "type": "BooleanSetting",
    "abstractKey": null
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
    "name": "UpdateUserSettingMutation",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "updateUserSetting",
        "plural": false,
        "selections": [
          (v3/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": null,
                "kind": "LinkedField",
                "name": "settings",
                "plural": true,
                "selections": (v4/*: any*/),
                "storageKey": null
              }
            ],
            "type": "UserSettingUpdated",
            "abstractKey": null
          },
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": null,
                "kind": "LinkedField",
                "name": "setting",
                "plural": false,
                "selections": (v4/*: any*/),
                "storageKey": null
              }
            ],
            "type": "UserSettingUpdateRejected",
            "abstractKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "UpdateUserSettingMutation",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "updateUserSetting",
        "plural": false,
        "selections": [
          (v3/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": null,
                "kind": "LinkedField",
                "name": "settings",
                "plural": true,
                "selections": (v7/*: any*/),
                "storageKey": null
              }
            ],
            "type": "UserSettingUpdated",
            "abstractKey": null
          },
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": null,
                "kind": "LinkedField",
                "name": "setting",
                "plural": false,
                "selections": (v7/*: any*/),
                "storageKey": null
              }
            ],
            "type": "UserSettingUpdateRejected",
            "abstractKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "id": "528EVmtst-oJbFHbns6wEw",
    "metadata": {},
    "name": "UpdateUserSettingMutation",
    "operationKind": "mutation",
    "text": null
  }
};
})();

(node as any).hash = "0c5824f3df155da7c25118f19bc114cb";

export default node;
