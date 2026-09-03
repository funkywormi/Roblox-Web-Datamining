/**
 * @generated SignedSource<<097b4036d7f4ae047788dddc19ead0ac>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type NotificationTypeListItemFragment$data = {
  readonly channels: ReadonlyArray<{
    readonly " $fragmentSpreads": FragmentRefs<"EnabledChannelsDescriptionFragment">;
  }>;
  readonly notificationType: {
    readonly value: string;
  };
  readonly " $fragmentType": "NotificationTypeListItemFragment";
};
export type NotificationTypeListItemFragment$key = {
  readonly " $data"?: NotificationTypeListItemFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"NotificationTypeListItemFragment">;
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
  "name": "NotificationTypeListItemFragment",
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

(node as any).hash = "961bbec389afdd236bfe3096aa4afd2e";

export default node;
