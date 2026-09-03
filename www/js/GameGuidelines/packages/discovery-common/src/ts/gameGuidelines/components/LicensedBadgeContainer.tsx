import React from "react";
import useGameDetailsForUniverseId from "../../gameDetails/hooks/useGameDetailsForUniverseId";
import metadataConstants from "../../gameDetails/constants/metadataConstants";

const LicensedBadgeContainer: React.FC = () => {
  const { universeId = "" } = metadataConstants.metadataData() || {};
  const { gameDetails } = useGameDetailsForUniverseId(universeId);

  if (gameDetails?.licenseDescription) {
    return (
      <div className="game-licensed-badges-container">
        <div className="game-licensed-badge">
          <div className="game-licensed-badge-info">{gameDetails?.licenseDescription}</div>
        </div>
      </div>
    );
  }
  return null;
};

export default LicensedBadgeContainer;
