/**
 * @generated SignedSource<<cdfe83c35f7899b6ee3e76bd5495cd71>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type NotificationCategoriesListFragment$data = {
  readonly categories: ReadonlyArray<{
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
      readonly " $fragmentSpreads": FragmentRefs<"SettingPageFragment">;
    }>;
    readonly " $fragmentSpreads": FragmentRefs<"CategoryPageFragment">;
  }>;
  readonly " $fragmentSpreads": FragmentRefs<"DeviceNotificationsPageFragment">;
  readonly " $fragmentType": "NotificationCategoriesListFragment";
};
export type NotificationCategoriesListFragment$key = {
  readonly " $data"?: NotificationCategoriesListFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"NotificationCategoriesListFragment">;
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
  "name": "NotificationCategoriesListFragment",
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
            }
          ],
          "storageKey": null
        },
        {
          "args": null,
          "kind": "FragmentSpread",
          "name": "CategoryPageFragment"
        }
      ],
      "storageKey": null
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "DeviceNotificationsPageFragment"
    }
  ],
  "type": "NotificationSettings",
  "abstractKey": null
};
})();

(node as any).hash = "64545f6352a19c8fdeb399138ff0cb75";

export default node;
