import type { JSX } from "react";
import { WithTranslationsProps } from "@rbx/core-scripts/react";
import useExperimentValues from "../../common/hooks/useExperimentValues";
import experimentConstants from "../../common/constants/experimentConstants";
import TopSongsInGameCarousel from "./TopSongsInGameCarousel";

export const TopSongsInGame = ({
  translate,
  universeId,
}: {
  translate: WithTranslationsProps["translate"];
  universeId: string;
}): JSX.Element | null => {
  const { ixpData, isLoading: ixpLoading } = useExperimentValues(
    experimentConstants.layerNames.gameDetails,
    experimentConstants.defaultValues.gameDetails,
  );

  if (ixpLoading || !ixpData.HasTopSongsEnabled) {
    return null;
  }

  return <TopSongsInGameCarousel translate={translate} universeId={universeId} />;
};

export default TopSongsInGame;
