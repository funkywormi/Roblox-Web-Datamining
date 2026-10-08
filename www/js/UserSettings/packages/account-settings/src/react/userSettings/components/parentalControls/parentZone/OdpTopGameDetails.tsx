import React, { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useGetOdpChildContextQuery } from "../../../../apis/parentalControlsApi";
import { ManagementAction } from "../../../../../types/parentConsentsTypes";
import useTopWeeklyGames from "../../../hooks/useTopWeeklyGames";
import { parentZonePages } from "../../../constants/parentalControls/parentZonePages";
import GameDetailsSection, {
  ManageExperienceOutcome,
  TManageExperienceOutcome,
} from "../shared/GameDetailsSection";
import useManageOdpExperience from "./hooks/useManageOdpExperience";

/**
 * One of the child's top experiences as their on-device parent sees it. Same page a remote parent
 * gets, except the block goes through the parent PIN: the wizard mints an ODP session, takes the
 * PIN, then applies the same `ManageExperience` consent the remote parent grants directly.
 */
export const OdpTopGameDetails = (): JSX.Element | null => {
  const { manageExperience: manageOdpExperience } = useManageOdpExperience();
  const { universeId: universeIdParam } = useParams<{ universeId: string }>();
  const universeId = Number(universeIdParam);

  const { data: odpChildContext } = useGetOdpChildContextQuery();
  const { games, isLoading } = useTopWeeklyGames();

  const game = useMemo(() => games.find(g => g.universeId === universeId), [games, universeId]);

  const manageExperience = async (action: ManagementAction): Promise<TManageExperienceOutcome> => {
    if (!game) return ManageExperienceOutcome.Settled;

    await manageOdpExperience(game.universeId, action);
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
