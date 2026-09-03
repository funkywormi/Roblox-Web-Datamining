import { O18EligibilityTag, Transaction, TransactionOriginType } from '../../../../ts';

export interface O18BadgeProps {
  label: string;
  tooltipTitle: string;
  tooltipDescription: string;
  tooltipContentClassName?: string;
}

type TranslateFunction = (key: string, params?: Record<string, string | number>) => string;

const DEV_EX_INCREASE_PERCENT = 42;
const ROBUX_AMOUNT_FORMAT_OPTIONS: Intl.NumberFormatOptions = {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2
};

const ELIGIBLE_TYPES = new Set<string>([TransactionOriginType.GroupPayout]);

// Returns the props for the O18 boost badge to render on the given transaction,
// or null if no badge should be shown.
//
// Defense-in-depth: the transaction-type gate keeps the badge off rows where
// the field never applies, even if the API ever leaked a value onto an
// unrelated row type.
export function getO18BadgeProps(
  transaction: Transaction,
  translate: TranslateFunction
): O18BadgeProps | null {
  if (!ELIGIBLE_TYPES.has(transaction.transactionType)) {
    return null;
  }

  // robuxRateBreakdown is set only on one-time group payouts. Checked ahead of
  // o18EligibilityTag so that if the API ever surfaces both on the same row, we
  // prefer the breakdown.
  const rateBreakdown = transaction.robuxRateBreakdown;
  if (rateBreakdown) {
    const hasO18 = rateBreakdown.o18 != null && rateBreakdown.o18 > 0;
    const hasStandard = rateBreakdown.standard != null && rateBreakdown.standard > 0;

    if (hasO18 && hasStandard) {
      const robuxAmountFormatter = new Intl.NumberFormat(undefined, ROBUX_AMOUNT_FORMAT_OPTIONS);
      const o18Rounded = robuxAmountFormatter.format(rateBreakdown.o18);
      const standardRounded = robuxAmountFormatter.format(rateBreakdown.standard);
      const label = translate('Label.O18OneTimePayoutCombinedRate');
      return {
        label,
        tooltipTitle: label,
        tooltipDescription: [
          translate('Tooltip.O18OneTimePayoutCombinedRateIntro'),
          translate('Tooltip.O18OneTimePayoutCombinedRateO18Amount', {
            robuxAmount: o18Rounded
          }),
          translate('Tooltip.O18OneTimePayoutCombinedRateStandardAmount', {
            robuxAmount: standardRounded
          })
        ].join('\n'),
        tooltipContentClassName: 'o18-badge-tooltip-multiline'
      };
    }
    if (hasO18) {
      const label = translate('Label.O18OneTimePayoutO18Only');
      return {
        label,
        tooltipTitle: label,
        tooltipDescription: translate('Tooltip.O18OneTimePayoutO18Only', {
          devExIncreasePercent: DEV_EX_INCREASE_PERCENT
        })
      };
    }
    // Standard-only or empty breakdown -> no badge
    return null;
  }

  if (
    transaction.o18EligibilityTag === O18EligibilityTag.O18Eligible ||
    transaction.o18EligibilityTag === O18EligibilityTag.O18EligibleAndPlus
  ) {
    const label = translate('Label.O18OneTimePayoutO18Only');
    return {
      label,
      tooltipTitle: label,
      tooltipDescription: translate('Tooltip.O18OneTimePayoutO18Only', {
        devExIncreasePercent: DEV_EX_INCREASE_PERCENT
      })
    };
  }

  return null;
}
