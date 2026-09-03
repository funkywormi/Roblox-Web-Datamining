/**
 * @generated SignedSource<<f51376d8f16a12f50908bf6553c7791e>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type RequiredActionType = "AgeCheckPending" | "ContentAgeRestrictionVerification" | "FacialAgeEstimation" | "IdVerification" | "Inherited" | "ParentConsentInherited" | "ParentalConsent" | "ReadableButNotActionable" | "SelfUpdateSetting" | "VpcForFae" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type DoNotDisturbSettingFragment$data = {
  readonly enabled: {
    readonly availableOptions: ReadonlyArray<{
      readonly option: {
        readonly value: string;
      };
      readonly requiredActions: ReadonlyArray<{
        readonly actionType: RequiredActionType;
      }>;
    }>;
    readonly selectedOption: {
      readonly enabled?: boolean;
      readonly value: string;
    } | null | undefined;
    readonly setting: {
      readonly value: string;
    };
  };
  readonly timeWindow: {
    readonly requiredActions: ReadonlyArray<{
      readonly actionType: RequiredActionType;
    }>;
    readonly setting: {
      readonly value: string;
    };
    readonly value: {
      readonly endTimeMinutes: number | null | undefined;
      readonly startTimeMinutes: number | null | undefined;
    } | null | undefined;
  };
  readonly " $fragmentType": "DoNotDisturbSettingFragment";
};
export type DoNotDisturbSettingFragment$key = {
  readonly " $data"?: DoNotDisturbSettingFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"DoNotDisturbSettingFragment">;
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
],
v2 = {
  "alias": null,
  "args": null,
  "concreteType": "PresentableValue",
  "kind": "LinkedField",
  "name": "setting",
  "plural": false,
  "selections": (v1/*: any*/),
  "storageKey": null
},
v3 = {
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
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "DoNotDisturbSettingFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "MultiOptionSetting",
      "kind": "LinkedField",
      "name": "enabled",
      "plural": false,
      "selections": [
        (v2/*: any*/),
        {
          "alias": null,
          "args": null,
          "concreteType": null,
          "kind": "LinkedField",
          "name": "selectedOption",
          "plural": false,
          "selections": [
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
            (v3/*: any*/)
          ],
          "storageKey": null
        }
      ],
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
        (v2/*: any*/),
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
        (v3/*: any*/)
      ],
      "storageKey": null
    }
  ],
  "type": "DoNotDisturbSettings",
  "abstractKey": null
};
})();

(node as any).hash = "e8f66de3d58a3c1a1a83aea9e4beb9b1";

export default node;
