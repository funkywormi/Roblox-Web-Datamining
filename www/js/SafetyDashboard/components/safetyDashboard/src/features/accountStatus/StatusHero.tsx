import type { ReactNode } from "react";
import { useTranslation } from "@rbx/core-scripts/react";
import { AccountStandingStatus } from "../../types/api";
import useAccountStanding from "../../api/useAccountStanding";
import StatusProgressBar from "./StatusProgressBar";
import StatusHeroSkeleton from "./StatusHeroSkeleton";
import { getStatusLevel, BANNED_DISPLAY, UNAVAILABLE_DISPLAY } from "./statusLevels";

interface StatusHeroProps {
  onStatusLinkPress: () => void;
}

interface HeroContent {
  heading: string;
  progressBar?: ReactNode;
  description: string;
  actionLabel: string;
  onActionPress: () => void;
}

/**
 * The main hero unit on the account status page. Displays the user's account status
 * and also has a description to explain to the user what's going on with their account.
 *
 * When the account-standing request fails we stay inline in the same hero shell so a
 * failure here doesn't disturb sibling cards on the dashboard that rely on other APIs.
 */
const StatusHero = ({ onStatusLinkPress }: StatusHeroProps) => {
  const { translate } = useTranslation();
  const { data, isLoading, isSuccess, refetch } = useAccountStanding();

  if (isLoading) {
    return <StatusHeroSkeleton />;
  }

  const unavailableContent: HeroContent = {
    heading: translate(UNAVAILABLE_DISPLAY.headingKey),
    description: translate(UNAVAILABLE_DISPLAY.descriptionKey),
    progressBar: <StatusProgressBar empty />,
    actionLabel: translate("Action.Retry"),
    onActionPress: () => {
      // Refetch returns a promise for callers that inspect results (we don't need this); query state still tracks failures.
      refetch().catch(() => undefined);
    },
  };

  let content: HeroContent;
  if (!isSuccess) {
    content = unavailableContent;
  } else if (data.statusInfo.status === AccountStandingStatus.Banned) {
    content = {
      heading: translate(BANNED_DISPLAY.headingKey),
      description: data.statusInfo.statusDescription,
      actionLabel: translate("Label.ViewDetails"),
      onActionPress: onStatusLinkPress,
    };
  } else {
    const statusLevel = getStatusLevel(data.statusInfo.status);
    content = statusLevel
      ? {
          heading: translate(statusLevel.headingKey),
          description: data.statusInfo.statusDescription,
          progressBar: <StatusProgressBar status={data.statusInfo.status} />,
          actionLabel: translate("Label.HowStatusWorks"),
          onActionPress: onStatusLinkPress,
        }
      : unavailableContent; // Fallback to the unavailable content if the status is not recognized.
  }

  return (
    <div
      data-testid="status-hero"
      className="flex flex-col gap-xlarge padding-xxlarge bg-surface-100 radius-large items-start"
    >
      <h1 className="text-heading-medium content-emphasis">{content.heading}</h1>

      {content.progressBar}
      {content.description && (
        <p className="text-body-medium content-default">{content.description}</p>
      )}

      <button
        type="button"
        className="text-body-small content-default padding-none bg-none stroke-none cursor-pointer underline width-fit"
        style={{ textUnderlineOffset: "3px" }}
        onClick={() => {
          content.onActionPress();
        }}
      >
        {content.actionLabel}
      </button>
    </div>
  );
};

export default StatusHero;
