import React from 'react';
import { useTranslation } from 'react-utilities';
import { Button } from '@rbx/foundation-ui';
import { GroupTierInfo } from '../../shared/communityTier/types';
import TierComparisonGrid from './TierComparisonGrid';

type TierProgressProps = {
  tierInfo: GroupTierInfo | null | undefined;
  isEvaluating: boolean;
  onRecheck: () => void;
  onStartRequirement: (requirementKey: string) => void;
};

/**
 * The page body for a community whose tier is earned: what the tiers offer, the
 * requirements standing between this community and the next one, and the action
 * to re-evaluate them.
 */
function TierProgress({
  tierInfo,
  isEvaluating,
  onRecheck,
  onStartRequirement
}: TierProgressProps): JSX.Element {
  const { translate } = useTranslation();

  return (
    <React.Fragment>
      <p className='text-body-medium content-default margin-top-small'>
        {translate('Description.CommunityTierSubheading')}
      </p>
      <div className='margin-top-small margin-bottom-large'>
        <Button variant='Standard' size='Small' isDisabled={isEvaluating} onClick={onRecheck}>
          {isEvaluating ? translate('Label.Checking') : translate('Action.Recheck')}
        </Button>
      </div>

      {/*
        With no tier reported there is no grid to draw, so the page is just the
        Recheck action. A failed evaluation already reports itself through the
        caller's existing NetworkError feedback, so this needs no extra copy.
      */}
      {tierInfo && (
        <TierComparisonGrid
          currentTier={tierInfo.currentTier}
          requirements={tierInfo.requirements}
          onStartRequirement={onStartRequirement}
        />
      )}
    </React.Fragment>
  );
}

export default TierProgress;
