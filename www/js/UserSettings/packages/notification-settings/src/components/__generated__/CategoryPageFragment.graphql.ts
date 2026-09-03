/**
 * @generated SignedSource<<7fca9bf9827f3b76ca0fbbb55d898b4f>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type CategoryPageFragment$data = {
  readonly category: {
    readonly value: string;
  };
  readonly notificationTypes: ReadonlyArray<{
    readonly channels: ReadonlyArray<{
      readonly preference: {
        readonly availableOptions: ReadonlyArray<{
          readonly option: {
            readonly value: string;
          };
        }>;
      };
    }>;
    readonly notificationType: {
      readonly value: string;
    };
    readonly " $fragmentSpreads": FragmentRefs<"CommunityNotificationTypeRowFragment" | "NotificationTypeListItemFragment" | "SettingPageFragment">;
  }>;
  readonly " $fragmentType": "CategoryPageFragment";
};
export type CategoryPageFragment$key = {
  readonly " $data"?: CategoryPageFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"CategoryPageFragment">;
};

const node: ReaderFragment = (function(){
var v0 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "value",
    "storageKey": null
  }
];
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "CategoryPageFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "PresentableValue",
      "kind": "LinkedField",
      "name": "category",
      "plural": false,
      "selections": (v0/*: any*/),
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
          "selections": (v0/*: any*/),
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
              "concreteType": "MultiOptionSetting",
              "kind": "LinkedField",
              "name": "preference",
              "plural": false,
              "selections": [
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
                      "selections": (v0/*: any*/),
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
          "args": null,
          "kind": "FragmentSpread",
          "name": "SettingPageFragment"
        },
        {
          "args": null,
          "kind": "FragmentSpread",
          "name": "NotificationTypeListItemFragment"
        },
        {
          "args": null,
          "kind": "FragmentSpread",
          "name": "CommunityNotificationTypeRowFragment"
        }
      ],
      "storageKey": null
    }
  ],
  "type": "NotificationCategory",
  "abstractKey": null
};
})();

(node as any).hash = "55303365c74c15add92a487bf0a022cf";

export default node;
