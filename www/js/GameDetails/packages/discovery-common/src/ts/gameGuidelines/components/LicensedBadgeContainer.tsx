import React from "react";
import { Badge, Tooltip, TooltipTrigger } from "@rbx/foundation-ui";
import { withTranslations, WithTranslationsProps } from "@rbx/core-scripts/react";
import { FeatureGameDetails } from "../../common/constants/translationConstants";
import metadataConstants from "../../gameDetails/constants/metadataConstants";
import useGameDetailsForUniverseId from "../../gameDetails/hooks/useGameDetailsForUniverseId";
import translationConfig from "../translation.config";

const LicensedBadgeContainer = ({ translate }: WithTranslationsProps): React.JSX.Element | null => {
  const { universeId = "" } = metadataConstants.metadataData() || {};
  const { gameDetails } = useGameDetailsForUniverseId(universeId);

  const isOfficial = Boolean(gameDetails?.isOfficiallyLicensed);
  const isCommunity = Boolean(gameDetails?.isCommunityLicensed);
  if (!isOfficial && !isCommunity) {
    return null;
  }

  const label = isOfficial
    ? translate(FeatureGameDetails.LabelOfficialBadge)
    : translate(FeatureGameDetails.LabelLicensedBadge);
  const tooltip = isOfficial
    ? translate(FeatureGameDetails.TooltipOfficialBadge)
    : translate(FeatureGameDetails.TooltipLicensedBadge);

  return (
    <Tooltip position="right-center" title={tooltip}>
      <TooltipTrigger asChild>
        <Badge
          variant="Neutral"
          shape="Box"
          label={label}
          className="game-title-license-badge"
          data-testid="game-title-license-badge"
        />
      </TooltipTrigger>
    </Tooltip>
  );
};

export default withTranslations(LicensedBadgeContainer, translationConfig);
