/**
 * @generated SignedSource<<6d6aafa0030de91be147adbda084976c>>
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
  "argumentDefinitions": [
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "surface"
    }
  ],
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
          "args": [
            {
              "kind": "Variable",
              "name": "surface",
              "variableName": "surface"
            }
          ],
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

(node as any).hash = "ef14fe14d5d9bb99c2d76048dfbe6e0e";

export default node;
