import { useNotApprovedTranslate } from "../../providers/NotApprovedUIProvider";
import { NAPageItemConfigType, PageItemRenderingProps } from "../ConfigTypes";
import { getReviewedEvidencePageItemConfigs } from "../reviewedEvidenceConfigs";

/**
 * A page item config that showcases what recent violation a user was punished for.
 * Although the component goes through the REVEIWED_EVIDENCE_CONTENT_CONFIG_LIST, only one of
 * the configs will actually be rendered.
 *
 * Once there is alignment on how we want to handle violation/badutterances, we can remove the filter
 * and properly convert those sub-configs into a regular component.
 */
const ReviewedEvidencePageItem = ({ punishmentData }: PageItemRenderingProps): JSX.Element => {
  const translate = useNotApprovedTranslate();

  const renderedPageItems = getReviewedEvidencePageItemConfigs()
    .map(config => {
      return config.getIsVisible(punishmentData) ? (
        <div key={config.configName}>{config.renderComponent({ punishmentData })}</div>
      ) : null;
    })
    .filter(Boolean);

  return (
    <div className="flex flex-col gap-medium" data-testid="reviewed-evidence-container">
      <span className="text-title-large">{translate("Label.LatestActivity")}</span>

      <div className="flex flex-col gap-xsmall">
        <div className="padding-large bg-shift-100 radius-medium">{renderedPageItems}</div>

        {/* Used for investigation purposes on our end. It is purposely hard to see since it's not important to the user. */}
        <span className="text-caption-medium content-muted">{punishmentData.interventionId}</span>
      </div>
    </div>
  );
};

const ReviewedEvidencePageItemConfig: NAPageItemConfigType = {
  getIsVisible: () => true,
  renderComponent: ReviewedEvidencePageItem,
  configName: "rewiewed-evidence",
};

export default ReviewedEvidencePageItemConfig;
