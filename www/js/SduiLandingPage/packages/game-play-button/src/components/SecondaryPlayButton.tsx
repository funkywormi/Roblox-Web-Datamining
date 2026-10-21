import React from "react";
import type { TPlayabilityStatus } from "../types/playButtonTypes";

/**
 * A secondary CTA that can be stacked under the primary play button (e.g. Play Demo).
 *
 * - `isEnabled` - Whether this case applies to the experience at all (e.g. a demo exists).
 * - `primaryStatuses` - Primary playability statuses this secondary button may appear alongside.
 * - `render` - Renders the secondary button.
 */
export type TSecondaryPlayButtonCase = {
  isEnabled: boolean;
  primaryStatuses: ReadonlySet<TPlayabilityStatus>;
  render: () => React.JSX.Element;
};

/**
 * Returns the secondary button to show for the given primary status: the first enabled case
 * whose `primaryStatuses` include it, or null. Only one secondary button shows at a time.
 */
export const getSecondaryPlayButton = (
  secondaryPlayButtonCases: readonly TSecondaryPlayButtonCase[],
  playabilityStatus: TPlayabilityStatus | undefined,
): React.JSX.Element | null => {
  if (playabilityStatus === undefined) {
    return null;
  }

  const secondaryPlayButtonCase = secondaryPlayButtonCases.find(
    ({ isEnabled, primaryStatuses }) => isEnabled && primaryStatuses.has(playabilityStatus),
  );

  return secondaryPlayButtonCase?.render() ?? null;
};

export type TStackedPlayButtonsProps = {
  primaryButton: React.JSX.Element;
  secondaryButton: React.JSX.Element | null;
  isPrimaryButtonLoading?: boolean;
};

/**
 * Stacks the primary button and a secondary button. The primary button is wrapped so it is a
 * single flex child (e.g. the Robux button plus its ItemPurchase modal), letting the container
 * space the two with `gap`. While isPrimaryButtonLoading, every secondary case is hidden; the
 * container stays mounted so the primary button doesn't remount once loading finishes.
 */
export const StackedPlayButtons = ({
  primaryButton,
  secondaryButton,
  isPrimaryButtonLoading = false,
}: TStackedPlayButtonsProps): React.JSX.Element =>
  secondaryButton ? (
    <div className="stacked-play-buttons-container">
      <div className="stacked-play-button-primary" data-testid="stacked-play-button-primary">
        {primaryButton}
      </div>
      {!isPrimaryButtonLoading && secondaryButton}
    </div>
  ) : (
    primaryButton
  );
