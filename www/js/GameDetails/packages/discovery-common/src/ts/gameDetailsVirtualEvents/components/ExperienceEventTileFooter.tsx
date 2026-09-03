import React from "react";
import { GameTileTextFooter } from "../../common/components/GameTileUtils";
import { TLayoutComponentType } from "../../common/types/bedev1Types";

type TExperienceEventTileFooterProps = {
  footerText: string;
  wideButton: JSX.Element;
};

const ExperienceEventTileFooter = ({
  footerText,
  wideButton,
}: TExperienceEventTileFooterProps): JSX.Element => {
  return (
    <div className="wide-game-tile-metadata">
      <div className="base-metadata">
        <GameTileTextFooter
          footerData={{
            type: TLayoutComponentType.TextLabel,
            text: {
              textLiteral: footerText,
            },
          }}
        />
        {wideButton}
      </div>
    </div>
  );
};

export default ExperienceEventTileFooter;
