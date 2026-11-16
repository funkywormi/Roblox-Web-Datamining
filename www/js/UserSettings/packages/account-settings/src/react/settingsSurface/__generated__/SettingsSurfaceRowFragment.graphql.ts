/**
 * @generated SignedSource<<5c2e0611ffe409d0ab2a2b489a3195f5>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type SettingsSurfaceRowFragment$data = {
  readonly __typename: "BooleanSetting";
  readonly " $fragmentSpreads": FragmentRefs<"BooleanSettingRowFragment">;
  readonly " $fragmentType": "SettingsSurfaceRowFragment";
} | {
  // This will never be '%other', but we need some
  // value in case none of the concrete values match.
  readonly __typename: "%other";
  readonly " $fragmentType": "SettingsSurfaceRowFragment";
};
export type SettingsSurfaceRowFragment$key = {
  readonly " $data"?: SettingsSurfaceRowFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"SettingsSurfaceRowFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "SettingsSurfaceRowFragment",
  "selections": [
    {
      "kind": "InlineFragment",
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "__typename",
          "storageKey": null
        },
        {
          "args": null,
          "kind": "FragmentSpread",
          "name": "BooleanSettingRowFragment"
        }
      ],
      "type": "BooleanSetting",
      "abstractKey": null
    }
  ],
  "type": "UserSetting",
  "abstractKey": "__isUserSetting"
};

(node as any).hash = "cd4e8b0fe19ef30b27015f628ab907b0";

export default node;
