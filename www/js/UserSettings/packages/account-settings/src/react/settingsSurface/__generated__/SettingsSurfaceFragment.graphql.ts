/**
 * @generated SignedSource<<1681373ff791d28f9519b8951a3bd8c9>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type SettingsSurfaceFragment$data = {
  readonly header: {
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
  };
  readonly settings: ReadonlyArray<{
    readonly __typename: string;
    readonly id: string;
    readonly " $fragmentSpreads": FragmentRefs<"SettingsSurfaceRowFragment">;
  } | null | undefined>;
  readonly " $fragmentType": "SettingsSurfaceFragment";
};
export type SettingsSurfaceFragment$key = {
  readonly " $data"?: SettingsSurfaceFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"SettingsSurfaceFragment">;
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
  "name": "SettingsSurfaceFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "PresentableValue",
      "kind": "LinkedField",
      "name": "header",
      "plural": false,
      "selections": [
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
      "concreteType": null,
      "kind": "LinkedField",
      "name": "settings",
      "plural": true,
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
          "name": "SettingsSurfaceRowFragment"
        }
      ],
      "storageKey": null
    }
  ],
  "type": "SettingsSurface",
  "abstractKey": null
};

(node as any).hash = "5563a90c79f2975f3d09286b6ee7eee5";

export default node;
