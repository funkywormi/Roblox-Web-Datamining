import React, { useMemo } from "react";
import { useParams } from "react-router-dom";
import { startWizard } from "@rbx/amp-v2-wizard";
import { authenticatedUser } from "header-scripts";
import baseApi from "../../../../apis/common/baseApi";
import { getBlockedExperiencesCacheTag } from "../../../../apis/experienceBlockingApi";
import { useGetOdpChildContextQuery } from "../../../../apis/parentalControlsApi";
import { useAppDispatch } from "../../../../redux/hooks";
import { ManagementAction } from "../../../../../types/parentConsentsTypes";
import useTopWeeklyGames from "../../../hooks/useTopWeeklyGames";
import { parentZonePages } from "../../../constants/parentalControls/parentZonePages";
import GameDetailsSection, {
  ManageExperienceOutcome,
  TManageExperienceOutcome,
} from "../shared/GameDetailsSection";

const odpFlowName = "ODP";
const manageExperienceRequestType = "ManageExperience";
const surface = "ParentalControlsSettings";

/**
 * One of the child's top experiences as their on-device parent sees it. Same page a remote parent
 * gets, except the block goes through the parent PIN: the wizard mints an ODP session, takes the
 * PIN, then applies the same `ManageExperience` consent the remote parent grants directly.
 */
export const OdpTopGameDetails = (): JSX.Element | null => {
  const dispatch = useAppDispatch();
  const { universeId: universeIdParam } = useParams<{ universeId: string }>();
  const universeId = Number(universeIdParam);
  // An on-device parent is signed in on the child's account, so this reads the current user.
  const childUserId = authenticatedUser.id!;

  const { data: odpChildContext } = useGetOdpChildContextQuery();
  const { games, isLoading } = useTopWeeklyGames();

  const game = useMemo(() => games.find(g => g.universeId === universeId), [games, universeId]);

  const manageExperience = async (action: ManagementAction): Promise<TManageExperienceOutcome> => {
    if (!game) return ManageExperienceOutcome.Settled;

    await startWizard({
      flow: {
        name: odpFlowName,
        props: {
          requestType: manageExperienceRequestType,
          requestDetails: {
            universeId: String(game.universeId),
            experienceManagementAction: action,
          },
          isOdpInitiated: true,
        },
      },
      surface,
    }).catch(() => {
      // startWizard resolves on every exit, so there is nothing to recover from here.
    });

    // The wizard reports an exit, not an outcome, so a cancelled PIN is indistinguishable from an
    // applied block. Re-read instead of announcing a result: the page then shows what actually
    // happened, and the limit notice stays with the server rather than being guessed at here.
    dispatch(baseApi.util.invalidateTags([getBlockedExperiencesCacheTag(childUserId)]));
    return ManageExperienceOutcome.Settled;
  };

  return (
    <GameDetailsSection
      game={game}
      isLoading={isLoading}
      listPath={parentZonePages.topGamesPage.path}
      canManageExperiences={odpChildContext?.canParentManageChildsExperiences === true}
      manageExperience={manageExperience}
    />
  );
};

export default OdpTopGameDetails;
