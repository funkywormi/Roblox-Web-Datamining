/**
 * @generated SignedSource<<2be357dab93f83666a068f392d91d3f3>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type DeviceNotificationsPageFragment$data = {
  readonly channels: ReadonlyArray<{
    readonly channel: {
      readonly value: string;
    };
    readonly preference: {
      readonly availableOptions: ReadonlyArray<{
        readonly option: {
          readonly value: string;
        };
      }>;
    };
    readonly " $fragmentSpreads": FragmentRefs<"ChannelToggleFragment">;
  }>;
  readonly doNotDisturb: {
    readonly enabled: {
      readonly availableOptions: ReadonlyArray<{
        readonly option: {
          readonly value: string;
        };
      }>;
    };
    readonly " $fragmentSpreads": FragmentRefs<"DoNotDisturbSettingFragment">;
  };
  readonly " $fragmentType": "DeviceNotificationsPageFragment";
};
export type DeviceNotificationsPageFragment$key = {
  readonly " $data"?: DeviceNotificationsPageFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"DeviceNotificationsPageFragment">;
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
],
v1 = [
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
];
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "DeviceNotificationsPageFragment",
  "selections": [
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
          "selections": (v0/*: any*/),
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "concreteType": "MultiOptionSetting",
          "kind": "LinkedField",
          "name": "preference",
          "plural": false,
          "selections": (v1/*: any*/),
          "storageKey": null
        },
        {
          "args": null,
          "kind": "FragmentSpread",
          "name": "ChannelToggleFragment"
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "DoNotDisturbSettings",
      "kind": "LinkedField",
      "name": "doNotDisturb",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "MultiOptionSetting",
          "kind": "LinkedField",
          "name": "enabled",
          "plural": false,
          "selections": (v1/*: any*/),
          "storageKey": null
        },
        {
          "args": null,
          "kind": "FragmentSpread",
          "name": "DoNotDisturbSettingFragment"
        }
      ],
      "storageKey": null
    }
  ],
  "type": "NotificationSettings",
  "abstractKey": null
};
})();

(node as any).hash = "643752da61ec73c5573c78b5245903d2";

export default node;
