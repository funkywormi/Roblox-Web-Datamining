import { TranslateFunction } from "@rbx/core-scripts/react";
import { Link } from "@rbx/core-ui";
import { buildReportAbuseRevampUrl } from "../../common/utils/browserUtils";
import { FeatureGameDetails } from "../../common/constants/translationConstants";
import BuildGameDisclaimer from "./BuildGameDisclaimer";

type TGameDescriptionFooterProps = {
  placeId: string;
  universeId: string;
  copyingAllowed: boolean;
  showBuildDisclaimer?: boolean;
  translate: TranslateFunction;
};

const GameDescriptionFooter = ({
  placeId,
  universeId,
  copyingAllowed,
  showBuildDisclaimer = false,
  translate,
}: TGameDescriptionFooterProps): JSX.Element => {
  const abuseReportUrl = buildReportAbuseRevampUrl({ placeId, universeId });

  return (
    <div className="game-description-footer">
      {showBuildDisclaimer && <BuildGameDisclaimer translate={translate} />}
      {copyingAllowed && (
        <p className="text-pastname">{translate(FeatureGameDetails.LabelPlaceCopyingAllowed)}</p>
      )}
      <Link className="text-report" url={abuseReportUrl}>
        {translate(FeatureGameDetails.LabelReportAbuse)}
      </Link>
    </div>
  );
};

export default GameDescriptionFooter;
