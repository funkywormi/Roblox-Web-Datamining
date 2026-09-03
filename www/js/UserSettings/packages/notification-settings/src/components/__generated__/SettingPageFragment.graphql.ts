/**
 * @generated SignedSource<<2d622b03ea1f37099b2b1fe22bdd87e3>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type SettingPageFragment$data = {
  readonly channels: ReadonlyArray<{
    readonly channel: {
      readonly isLegallySensitive: boolean | null | undefined;
      readonly value: string;
    };
    readonly " $fragmentSpreads": FragmentRefs<"ChannelToggleFragment" | "EnabledChannelsDescriptionFragment">;
  }>;
  readonly notificationType: {
    readonly value: string;
  };
  readonly " $fragmentType": "SettingPageFragment";
};
export type SettingPageFragment$key = {
  readonly " $data"?: SettingPageFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"SettingPageFragment">;
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
  "name": "SettingPageFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "PresentableValue",
      "kind": "LinkedField",
      "name": "notificationType",
      "plural": false,
      "selections": (v1/*: any*/),
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
          "args": null,
          "kind": "FragmentSpread",
          "name": "ChannelToggleFragment"
        },
        {
          "kind": "InlineDataFragmentSpread",
          "name": "EnabledChannelsDescriptionFragment",
          "selections": [
            {
              "alias": null,
              "args": null,
              "concreteType": "PresentableValue",
              "kind": "LinkedField",
              "name": "channel",
              "plural": false,
              "selections": (v1/*: any*/),
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
                }
              ],
              "storageKey": null
            }
          ],
          "args": null,
          "argumentDefinitions": []
        }
      ],
      "storageKey": null
    }
  ],
  "type": "NotificationType",
  "abstractKey": null
};
})();

(node as any).hash = "598718ba1791a2520d7c548bf7c20590";

export default node;
