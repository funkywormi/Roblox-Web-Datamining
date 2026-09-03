import { ShareLinks } from "@rbx/core-scripts/deep-link";
import { FeatureSocialShare } from "../../common/constants/translationConstants";

export const inviteLinkInvalidModalTranslationMap = {
  [ShareLinks.ExperienceInviteStatus.EXPIRED]: {
    Header: FeatureSocialShare.LabelInviteExpiredError,
    Description: FeatureSocialShare.DescriptionInviteExpiredError,
  },
  [ShareLinks.ExperienceInviteStatus.INVITER_NOT_IN_EXPERIENCE]: {
    Header: FeatureSocialShare.LabelInviterNotHereError,
    Description: FeatureSocialShare.DescriptionInviterNotHereError,
  },
};

const gameDetailsInviteLinkInvalidModalContainerId =
  "game-details-invite-link-expired-modal-container";
const gameDetailsInviteLinkInvalidModalContainer = (): HTMLElement | null =>
  document.getElementById(gameDetailsInviteLinkInvalidModalContainerId);

export default {
  gameDetailsInviteLinkInvalidModalContainerId,
  gameDetailsInviteLinkInvalidModalContainer,
};
