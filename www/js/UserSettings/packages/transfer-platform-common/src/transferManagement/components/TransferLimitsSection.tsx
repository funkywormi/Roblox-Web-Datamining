import type React from "react";
import { Fragment } from "react";
import { useTranslation } from "@rbx/core-scripts/react";
import environmentUrls from "@rbx/environment-urls";
import { Icon } from "@rbx/foundation-ui";
import translationConstants from "../../core/constants/translationConstants";
import {
  HigherLimitsIneligibilityReason,
  type HigherLimitsIneligibilityReason as HigherLimitsIneligibilityReasonType,
} from "../../core/types/transferLimitTypes";

type TransferLimitsSectionProps = {
  dailyLimit: number;
  monthlyLimit: number;
  isEligibleForHigherLimitsUpsell: boolean;
  higherLimitsIneligibilityReason?: HigherLimitsIneligibilityReasonType | null;
};

const SECURITY_SETTINGS_URL = "/my/account#!/security";
const TRANSACTION_HISTORY_URL = "/transactions";
const HIGHER_LIMITS_LEARN_MORE_ARTICLE_PATH = "/hc/articles/48510707796756";
const higherLimitsLearnMoreUrl = `${environmentUrls.helpSite}${HIGHER_LIMITS_LEARN_MORE_ARTICLE_PATH}`;

const INELIGIBILITY_REASON_TRANSLATION_KEYS: Record<HigherLimitsIneligibilityReasonType, string> = {
  [HigherLimitsIneligibilityReason.RecentModeration]:
    translationConstants.higherLimitsIneligibleModeration,
  [HigherLimitsIneligibilityReason.RecentRefundOrChargeback]:
    translationConstants.higherLimitsIneligibleRefundOrChargeback,
  [HigherLimitsIneligibilityReason.InsufficientPurchaseHistory]:
    translationConstants.higherLimitsIneligiblePurchaseHistory,
};

const getHigherLimitsIneligibilityTranslationKey = (
  reason: HigherLimitsIneligibilityReasonType | null | undefined,
): string | null => {
  if (reason == null) {
    return null;
  }

  if (!(reason in INELIGIBILITY_REASON_TRANSLATION_KEYS)) {
    return null;
  }

  return INELIGIBILITY_REASON_TRANSLATION_KEYS[reason];
};

const HigherLimitsUpsellRow = ({ isActive }: { isActive: boolean }): React.JSX.Element => {
  const { translate } = useTranslation();
  const mutedTextClass = isActive ? "" : "content-muted";

  const rowContent = (
    <Fragment>
      <div className="settings-list-item-info flex flex-col gap-xsmall">
        <span className={`setting-name text-title-medium ${mutedTextClass}`}>
          {translate(translationConstants.enableHigherLimitsLabel)}
        </span>
        <span className={`text-body-medium ${mutedTextClass}`}>
          {translate(translationConstants.enableHigherLimitsDescription)}
        </span>
      </div>
      <div className="settings-list-item-value-arrow">
        <Icon className={mutedTextClass} name="icon-regular-chevron-large-right" size="Medium" />
      </div>
    </Fragment>
  );

  return (
    <div className="radius-large stroke-standard stroke-muted padding-y-small padding-x-large margin-top-small margin-bottom-xsmall">
      {isActive ? (
        <a
          href={SECURITY_SETTINGS_URL}
          className="settings-list-item-container margin-none padding-medium"
        >
          {rowContent}
        </a>
      ) : (
        <div className="settings-list-item-container margin-none padding-medium content-muted">
          {rowContent}
        </div>
      )}
    </div>
  );
};

const HigherLimitsIneligibilitySubtext = ({
  translationKey,
}: {
  translationKey: string;
}): React.JSX.Element => {
  const { translate } = useTranslation();

  return (
    <div
      className="text-body-medium padding-top-small"
      // eslint-disable-next-line react/no-danger -- translation strings include localized link markup
      dangerouslySetInnerHTML={{
        __html: translate(translationKey, {
          linkStart: `<a href="${higherLimitsLearnMoreUrl}" class="text-link underline" target="_blank" rel="noopener noreferrer">`,
          linkEnd: "</a>",
        }),
      }}
    />
  );
};

const TransferLimitsSection = ({
  dailyLimit,
  monthlyLimit,
  isEligibleForHigherLimitsUpsell,
  higherLimitsIneligibilityReason,
}: TransferLimitsSectionProps): React.JSX.Element => {
  const { translate } = useTranslation();
  const ineligibilityTranslationKey = getHigherLimitsIneligibilityTranslationKey(
    higherLimitsIneligibilityReason,
  );
  const showUpsellButton = isEligibleForHigherLimitsUpsell;
  const showIneligibilitySubtext = ineligibilityTranslationKey != null;
  const showHigherLimitsUpsellSection = showUpsellButton || showIneligibilitySubtext;

  return (
    <div className="setting-section">
      <div className="container-header">
        <h2 className="setting-section-header">
          {translate(translationConstants.transfersHeading)}
        </h2>
      </div>

      <div className="radius-large stroke-standard stroke-muted clip">
        <div className="padding-large padding-bottom-small flex flex-col gap-xsmall">
          <span className="text-title-medium">{translate(translationConstants.dailyLimit)}</span>
          <div className="flex items-center gap-xsmall">
            <Icon name="icon-regular-robux" size="Small" />
            <span className="text-body-medium">{dailyLimit.toLocaleString()}</span>
          </div>
        </div>
        <div className="rbx-divider margin-none" />
        <div className="padding-large padding-top-small flex flex-col gap-xsmall">
          <span className="text-title-medium">{translate(translationConstants.monthlyLimit)}</span>
          <div className="flex items-center gap-xsmall">
            <Icon name="icon-regular-robux" size="Small" />
            <span className="text-body-medium">{monthlyLimit.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {showHigherLimitsUpsellSection && (
        <Fragment>
          {showUpsellButton && <HigherLimitsUpsellRow isActive={!showIneligibilitySubtext} />}
          {showIneligibilitySubtext && (
            <HigherLimitsIneligibilitySubtext translationKey={ineligibilityTranslationKey} />
          )}
        </Fragment>
      )}

      <div className="container-header margin-top-large padding-top-medium">
        <h2 className="setting-section-header">
          {translate(translationConstants.robuxTransactions)}
        </h2>
      </div>

      <div className="radius-large stroke-standard stroke-muted padding-x-large">
        <a
          href={TRANSACTION_HISTORY_URL}
          className="settings-list-item-container margin-none padding-medium"
        >
          <span className="setting-name text-title-medium">
            {translate(translationConstants.transactionHistory)}
          </span>
          <div className="settings-list-item-value-arrow">
            <Icon name="icon-regular-arrow-up-right-from-square" size="Medium" />
          </div>
        </a>
      </div>
    </div>
  );
};

export default TransferLimitsSection;
