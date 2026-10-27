import React, { useEffect, useState } from "react";
import { WithTranslationsProps, withTranslations } from "@rbx/core-scripts/react";
import bedev2Services from "../common/services/bedev2Services";
import experimentConstants from "../common/constants/experimentConstants";
import { gamePassTranslationConfig } from "./translation.config";
import GameStorePreview from "./components/GameStorePreview";

const { layerNames, defaultValues } = experimentConstants;

export const GameStorePreviewExperiment = ({ translate }: WithTranslationsProps): JSX.Element => {
  const [isGameStorePreviewEnabled, setIsGameStorePreviewEnabled] = useState<boolean | undefined>(
    undefined,
  );

  useEffect(() => {
    bedev2Services
      .getExperimentationValues(layerNames.gameDetails, defaultValues.gameDetails)
      .then(gameDetailsLayerData =>
        setIsGameStorePreviewEnabled(gameDetailsLayerData.IsGameStorePreviewEnabled === true),
      )
      .catch(() => {
        setIsGameStorePreviewEnabled(false);
      });
  }, []);

  if (isGameStorePreviewEnabled === true) {
    return <GameStorePreview translate={translate} />;
  }

  return <React.Fragment />;
};

export default withTranslations(GameStorePreviewExperiment, gamePassTranslationConfig);
