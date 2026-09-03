import React, { useState } from "react";
import { SimpleModal } from "@rbx/core-ui";
import { withTranslations, WithTranslationsProps } from "@rbx/core-scripts/react";
import { buildPlayGameProperties, launchGame } from "@rbx/core-scripts/game";
import { sendEventWithTarget } from "@rbx/core-scripts/event-stream";
import { ShareLinks } from "@rbx/core-scripts/deep-link";
import { FeatureSocialShare } from "../../common/constants/translationConstants";
import { inviteLinkInvalidModalConfig } from "../translation.config";
import {
  buildInviteLinkInvalidModalEvent,
  buildInviteLinkInvalidModalLaunchGameEvent,
  joinButtonName,
  cancelButtonName,
} from "./inviteLinkInvalidModalEventStreamUtils";
import { inviteLinkInvalidModalTranslationMap } from "../constants/inviteLinkInvalidModalConstants";
import useGameDetailsForUniverseId from "../hooks/useGameDetailsForUniverseId";

const { ExperienceInviteStatus } = ShareLinks;

export type TInviteLinkInvalidModalProps = {
  linkId: string;
  linkStatus: Exclude<
    (typeof ExperienceInviteStatus)[keyof typeof ExperienceInviteStatus],
    typeof ExperienceInviteStatus.VALID
  >;
  placeId: string;
  universeId: string;
};

export const InviteLinkInvalidModal = ({
  translate,
  linkId,
  linkStatus,
  placeId,
  universeId,
}: TInviteLinkInvalidModalProps & WithTranslationsProps): JSX.Element => {
  const [showModal, setShowModal] = useState(true);

  const { gameDetails } = useGameDetailsForUniverseId(universeId);

  const modalBody = (
    <p>
      {translate(inviteLinkInvalidModalTranslationMap[linkStatus].Description, {
        experienceName: gameDetails?.name,
      })}
    </p>
  );

  const closeModal = () => setShowModal(false);

  const joinGame = () => {
    // TODO(npatel, 2024-12-03): Modularize this code separately and add stricter type validation via zod.
    let referredByPlayerId = "0";
    if (window.localStorage.getItem("ref_info") !== null) {
      const refInfo: { [key: string]: string } = (() => {
        const refInfoRaw = window.localStorage.getItem("ref_info");
        if (!refInfoRaw) return {};
        try {
          return JSON.parse(atob(refInfoRaw)) as { [key: string]: string };
        } catch {
          return {};
        }
      })();
      referredByPlayerId = refInfo[placeId]!;
    }
    launchGame(
      buildPlayGameProperties(
        placeId,
        placeId,
        undefined,
        undefined,
        undefined,
        referredByPlayerId,
      ),
      buildInviteLinkInvalidModalLaunchGameEvent(placeId, linkId, linkStatus),
    );
    if (window.localStorage.getItem("ref_info")) {
      window.localStorage.removeItem("ref_info");
    }
    const event = buildInviteLinkInvalidModalEvent(joinButtonName, linkId, linkStatus);
    sendEventWithTarget(event.type, event.context, event.params);

    closeModal();
  };

  const neutralClick = () => {
    const event = buildInviteLinkInvalidModalEvent(cancelButtonName, linkId, linkStatus);
    sendEventWithTarget(event.type, event.context, event.params);

    closeModal();
  };

  return (
    <SimpleModal
      show={showModal}
      title={translate(inviteLinkInvalidModalTranslationMap[linkStatus].Header)}
      body={gameDetails && modalBody}
      loading={!gameDetails}
      actionButtonShow
      actionButtonText={translate(FeatureSocialShare.LabelPlay)}
      neutralButtonText={translate(FeatureSocialShare.LabelCancel)}
      onAction={joinGame}
      onClose={closeModal}
      onNeutral={neutralClick}
    />
  );
};

export default withTranslations(InviteLinkInvalidModal, inviteLinkInvalidModalConfig);
