/**
 * @generated SignedSource<<f12426230f534d75bdd44c3b77c0c1eb>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type RequiredActionType = "AgeCheckPending" | "ContentAgeRestrictionVerification" | "FacialAgeEstimation" | "IdVerification" | "Inherited" | "ParentConsentInherited" | "ParentalConsent" | "ReadableButNotActionable" | "SelfUpdateSetting" | "VpcForFae" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type ChannelToggleFragment$data = {
  readonly channel: {
    readonly isLegallySensitive: boolean | null | undefined;
    readonly value: string;
  };
  readonly preference: {
    readonly availableOptions: ReadonlyArray<{
      readonly option: {
        readonly value: string;
      };
      readonly requiredActions: ReadonlyArray<{
        readonly actionType: RequiredActionType;
      }>;
    }>;
    readonly selectedOption: {
      readonly __typename: string;
      readonly enabled?: boolean;
      readonly value: string;
    } | null | undefined;
    readonly setting: {
      readonly value: string;
    };
  };
  readonly " $fragmentType": "ChannelToggleFragment";
};
export type ChannelToggleFragment$key = {
  readonly " $data"?: ChannelToggleFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"ChannelToggleFragment">;
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
  (v0/*: any*/)
];
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ChannelToggleFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "PresentableValue",
      "kind": "LinkedField",
      "name": "channel",
      "plural": false,
      "selections": [
        (v0/*: any*/),
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "isLegallySensitive",
          "storageKey": null
        }
      ],
      "storageKey": null
    },
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
          "concreteType": "PresentableValue",
          "kind": "LinkedField",
          "name": "setting",
          "plural": false,
          "selections": (v1/*: any*/),
          "storageKey": null
        },
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
            (v0/*: any*/),
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
        },
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
              "selections": (v1/*: any*/),
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
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "NotificationChannel",
  "abstractKey": null
};
})();

(node as any).hash = "1801a6865db2e8e62c3230422a527979";

export default node;
