import { useState } from "react";
import { CollectionCarousel } from "@rbx/foundation-ui";
import { useTranslation } from "@rbx/core-scripts/react";
import { AccountStandingStatus } from "../../types/api";
import type { RecommendedRule } from "../../types/api";
import useAccountStanding from "../../api/useAccountStanding";
import useRecommendedRules from "../../api/useRecommendedRules";
import useCarouselPosition from "../../hooks/useCarouselPosition";
import { SafetyDashboardEventType } from "../../telemetry/eventTypes";
import { sendSafetyDashboardEvent } from "../../telemetry/sendSafetyDashboardEvent";
import CarouselDots from "./CarouselDots";
import TipCard from "./TipCard";
import CommunityTipDialog from "./CommunityTipDialog";
import CommunityTipsSkeleton from "./CommunityTipsSkeleton";
import { buildFallbackRecommendedRules } from "./fallbackCommunityTips";

/**
 * A sidescrolling carousel of community tips (i.e. Community Standard policy education content).
 * The tips are displayed as cards, and the user can swipe through them to view each tip.
 */
const CommunityTipsSection = () => {
  const { translate } = useTranslation();

  const { data: standing, isLoading: standingLoading } = useAccountStanding();
  const { data: recommendedRules, isLoading: tipsLoading } = useRecommendedRules();
  const { carouselRef, activeIndex, showDots } = useCarouselPosition();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTip, setSelectedTip] = useState<RecommendedRule | undefined>(undefined);

  if (standingLoading || tipsLoading) {
    return <CommunityTipsSkeleton />;
  }

  if (!standing || standing.statusInfo.status === AccountStandingStatus.Banned) {
    return null;
  }

  /**
   * We always try to use the recommended rules output from the backend. If the endpoint fails or returns
   * no content, we want to fallback with a default set of fallback tips to ensure the user always has
   * something to read through.
   */
  const tips =
    recommendedRules && recommendedRules.length > 0
      ? recommendedRules
      : buildFallbackRecommendedRules(translate);

  /**
   * Users in good standing (all good or fair) see the generic community tips copy. Everyone else
   * (e.g. at risk or critical) has had moderation actions taken, so they get the personalized copy.
   */
  const isInGoodStanding =
    standing.statusInfo.status === AccountStandingStatus.AllGood ||
    standing.statusInfo.status === AccountStandingStatus.Fair;
  const headingKey = isInGoodStanding
    ? "Heading.CommunityTips"
    : "Heading.CommunityTips.Personalized";
  const descriptionKey = isInGoodStanding
    ? "Description.CommunityTips"
    : "Description.CommunityTips.Personalized";

  const handleTipPress = (tip: RecommendedRule) => {
    sendSafetyDashboardEvent(
      SafetyDashboardEventType.TipPress,
      { tipId: tip.policyKey },
      standing.statusInfo.status,
      standing.worstPlatformIntervention?.type,
    );
    setSelectedTip(tip);
    setDialogOpen(true);
  };

  return (
    <div data-testid="community-tips-section" className="flex flex-col gap-medium">
      <div className="flex flex-col">
        <h2 className="text-heading-small content-emphasis">{translate(headingKey)}</h2>
        <p className="text-body-medium">{translate(descriptionKey)}</p>
      </div>

      <CollectionCarousel
        ref={carouselRef}
        discretePosition
        hasMargin={false}
        className="padding-bottom-xsmall"
      >
        {tips.map(tip => (
          <TipCard
            key={tip.ruleTitle}
            tip={tip}
            onPress={() => {
              handleTipPress(tip);
            }}
          />
        ))}
      </CollectionCarousel>

      {/* We only need to show the indicator dots on smaller screens since larger screens can show many cards at once */}
      {showDots && <CarouselDots itemCount={tips.length} activeIndex={activeIndex} />}

      <CommunityTipDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
        }}
        tip={selectedTip}
      />
    </div>
  );
};

export default CommunityTipsSection;
