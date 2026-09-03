/**
 * @generated SignedSource<<5363c056938ae5f4c38607d0b2563943>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderInlineDataFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type EnabledChannelsDescriptionFragment$data = {
  readonly channel: {
    readonly value: string;
  };
  readonly preference: {
    readonly selectedOption: {
      readonly __typename: string;
      readonly enabled?: boolean;
      readonly value: string;
    } | null | undefined;
  };
  readonly " $fragmentType": "EnabledChannelsDescriptionFragment";
};
export type EnabledChannelsDescriptionFragment$key = {
  readonly " $data"?: EnabledChannelsDescriptionFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"EnabledChannelsDescriptionFragment">;
};

const node: ReaderInlineDataFragment = {
  "kind": "InlineDataFragment",
  "name": "EnabledChannelsDescriptionFragment"
};

(node as any).hash = "ebef0a508b78cf490a66dd033cf0146d";

export default node;
