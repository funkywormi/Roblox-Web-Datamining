/**
 * @generated SignedSource<<2ce2597432b73e4cc1077fa22ddadff7>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type RequiredActionType = "AgeCheckPending" | "ContentAgeRestrictionVerification" | "FacialAgeEstimation" | "IdVerification" | "Inherited" | "ParentConsentInherited" | "ParentalConsent" | "ReadableButNotActionable" | "SelfUpdateSetting" | "VpcForFae" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type BooleanSettingRowFragment$data = {
  readonly enabled: boolean;
  readonly id: string;
  readonly off: {
    readonly option: {
      readonly value: string;
    };
    readonly requiredActions: ReadonlyArray<{
      readonly actionType: RequiredActionType;
    }>;
  };
  readonly on: {
    readonly option: {
      readonly value: string;
    };
    readonly requiredActions: ReadonlyArray<{
      readonly actionType: RequiredActionType;
    }>;
  };
  readonly setting: {
    readonly presentation: {
      readonly description: {
        readonly links: ReadonlyArray<{
          readonly closing: string;
          readonly opening: string;
          readonly url: string;
        }>;
        readonly text: string;
      } | null | undefined;
      readonly label: string;
    } | null | undefined;
    readonly value: string;
  };
  readonly " $fragmentType": "BooleanSettingRowFragment";
};
export type BooleanSettingRowFragment$key = {
  readonly " $data"?: BooleanSettingRowFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"BooleanSettingRowFragment">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "value",
  "storageKey": null
},
v1 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "PresentableValue",
    "kind": "LinkedField",
    "name": "option",
    "plural": false,
    "selections": [
      (v0/*: any*/)
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
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "BooleanSettingRowFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "PresentableValue",
      "kind": "LinkedField",
      "name": "setting",
      "plural": false,
      "selections": [
        (v0/*: any*/),
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
      "selections": (v1/*: any*/),
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "SettingOption",
      "kind": "LinkedField",
      "name": "off",
      "plural": false,
      "selections": (v1/*: any*/),
      "storageKey": null
    }
  ],
  "type": "BooleanSetting",
  "abstractKey": null
};
})();

(node as any).hash = "51144420bb23a2fa235f5c901dba74ec";

export default node;
