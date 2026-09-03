import React from "react";
import { Violation, Asset } from "@rbx/moderation-portal";
import { WithTranslationsProps } from "@rbx/core-scripts/react";

import { translateHtml } from "@rbx/translation-utils";
import CommunityStandardsLink from "../CommunityStandardsLink";
import {
  isAssetContent,
  isBundleContent,
  isAvatarContent,
  isLookContent,
  isUserProfileContent,
  isChatContent,
  isPlatformEvidence,
  isLimited,
} from "./types";

const assetTypeToLabel: Record<Asset["asset_type"], string> = {
  ASSET_TYPE_AUDIO: "Label.Type.Audio",
  ASSET_TYPE_IMAGE: "Label.Type.Image",
  ASSET_TYPE_UNSPECIFIED: "Label.Type.Asset",
  ASSET_TYPE_MODEL: "Label.Type.Model",
  ASSET_TYPE_EXPERIENCE: "Label.Type.Experience",
  ASSET_TYPE_3D_ACCESSORY: "Label.Type.AvatarAccessory",
  ASSET_TYPE_MESH: "Label.Type.Mesh",
  ASSET_TYPE_PLUGIN: "Label.Type.Plugin",
};

const assetTypeToLowerCaseLabel: Record<Asset["asset_type"], string> = {
  ASSET_TYPE_AUDIO: "Label.TypeLower.Audio",
  ASSET_TYPE_IMAGE: "Label.TypeLower.Image",
  ASSET_TYPE_UNSPECIFIED: "Label.TypeLower.Asset",
  ASSET_TYPE_MODEL: "Label.TypeLower.Model",
  ASSET_TYPE_EXPERIENCE: "Label.TypeLower.Experience",
  ASSET_TYPE_3D_ACCESSORY: "Label.TypeLower.AvatarAccessory",
  ASSET_TYPE_MESH: "Label.TypeLower.Mesh",
  ASSET_TYPE_PLUGIN: "Label.TypeLower.Plugin",
};

export interface ViolationItemI18n {
  contentType: string;
  contentTypeLower: string;
  rejectionTitle: React.ReactNode;
  rejectionReversedTitle: React.ReactNode;
  rejectionDescription: React.ReactNode;
}

const getDummyI18nItem = (): ViolationItemI18n => ({
  contentType: "Unknown",
  contentTypeLower: "unknown",
  rejectionTitle: "Unknown",
  rejectionReversedTitle: "Unknown",
  rejectionDescription: "Unknown",
});

export const getTranslationKeysForViolation = (
  violation: Violation,
  i18n: WithTranslationsProps,
): ViolationItemI18n => {
  const translation = getDummyI18nItem();

  // Violations might have both content and evidence set, but we only care about one of them.
  // We prioritize evidence over content.
  if (isPlatformEvidence(violation.evidence)) {
    translation.contentType = i18n.translate(violation.evidence.display_meta.capitalized_key);
    translation.contentTypeLower = i18n.translate(violation.evidence.display_meta.lowercase_key);
  } else if (isAssetContent(violation.content)) {
    translation.contentType = i18n.translate(
      assetTypeToLabel[violation.content.asset_type] || "Unknown",
    );
    translation.contentTypeLower = i18n.translate(
      assetTypeToLowerCaseLabel[violation.content.asset_type] || "Unknown",
    );
  } else if (isBundleContent(violation.content)) {
    translation.contentType = i18n.translate("Label.Type.Bundle");
    translation.contentTypeLower = i18n.translate("Label.TypeLower.Bundle");
  } else if (isAvatarContent(violation.content) || isUserProfileContent(violation.content)) {
    translation.contentType = i18n.translate("Label.Type.Avatar");
    translation.contentTypeLower = i18n.translate("Label.TypeLower.Avatar");
  } else if (isLookContent(violation.content)) {
    translation.contentType = i18n.translate("Label.Type.Look");
    translation.contentTypeLower = i18n.translate("Label.TypeLower.Look");
  } else if (isChatContent(violation.content)) {
    translation.contentType = i18n.translate("Label.Type.Chat");
    translation.contentTypeLower = i18n.translate("Label.TypeLower.Chat");
  }

  if (isLimited(violation)) {
    translation.contentType = i18n.translate("Label.YourBehavior");
    translation.rejectionTitle = i18n.translate("Label.TypeBrokeRules.Generic");
    translation.rejectionReversedTitle = translation.rejectionTitle;
  } else if (isPlatformEvidence(violation.evidence) || isChatContent(violation.content)) {
    translation.rejectionTitle = i18n.translate("Label.TypeBrokeRules", {
      type: translation.contentTypeLower,
    });
    translation.rejectionReversedTitle = translation.rejectionTitle;

    translation.rejectionDescription = translateHtml(
      i18n.translate,
      "Description.ItemInitialRejectionDescription",
      [
        {
          opening: "link",
          closing: "linkEnd",
          render: text => <CommunityStandardsLink>{text}</CommunityStandardsLink>,
        },
      ],
      { type: translation.contentTypeLower },
    );
  } else if (isAvatarContent(violation.content) || isUserProfileContent(violation.content)) {
    translation.rejectionTitle = i18n.translate("Label.TypeReset", {
      type: translation.contentType,
    });
    // we don't undo the avatar reset, so we leave the title as is
    // and rely on our description to explain the action
    translation.rejectionReversedTitle = translation.rejectionTitle;
    translation.rejectionDescription = translateHtml(
      i18n.translate,
      "Description.ItemResetDescription",
      [
        {
          opening: "link",
          closing: "linkEnd",
          render: text => <CommunityStandardsLink>{text}</CommunityStandardsLink>,
        },
      ],
      { type: translation.contentTypeLower },
    );
  } else {
    translation.rejectionReversedTitle = i18n.translate("Label.TypeRestored", {
      type: translation.contentType,
    });
    translation.rejectionTitle = i18n.translate("Label.TypeRemoved", {
      type: translation.contentType,
    });
    translation.rejectionDescription = translateHtml(
      i18n.translate,
      "Description.ItemRemovalDescription3",
      [
        {
          opening: "link",
          closing: "linkEnd",
          render: text => <CommunityStandardsLink>{text}</CommunityStandardsLink>,
        },
      ],
      { type: translation.contentTypeLower },
    );
  }

  return translation;
};

/**
 * Maps a violation's state to the translation key for the compact status line
 * shown in `ViolationRow`. States not present here (e.g. INITIATED,
 * APPEAL_ACTIVE) intentionally have no status line.
 */
const violationStateToStatusKey: Partial<Record<Violation.state, string>> = {
  [Violation.state.VIOLATION_STATE_APPEAL_DENIED]: "Label.AppealDenied",
  [Violation.state.VIOLATION_STATE_APPEAL_ACCEPTED]: "Label.AppealAccepted",
  [Violation.state.VIOLATION_STATE_INACTIVE]: "Label.ViolationInactive",
  [Violation.state.VIOLATION_STATE_EDUCATIONAL_PASS]: "Heading.AppealUnavailable",
};

/**
 * Derives the translated appeal-status string for a violation based on its
 * state, or `undefined` when the state has no status line to show.
 */
export const getAppealStatusI18n = (
  violation: Violation,
  i18n: WithTranslationsProps,
): string | undefined => {
  const key = violationStateToStatusKey[violation.state];
  return key ? i18n.translate(key) : undefined;
};
