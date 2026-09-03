import React, { useCallback } from 'react';
import { useTranslation } from 'react-utilities';
import { Loading, useSystemFeedback } from 'react-style-guide';
import { useConfigureCommunityTier } from '../../shared/communityTier/useCommunityTier';
import startRequirementAction from '../../shared/communityTier/requirementActions';
import EnterpriseNotice from './EnterpriseNotice';
import TierProgress from './TierProgress';

type CommunityTierPageProps = {
  groupId: number;
};

function CommunityTierPage({ groupId }: CommunityTierPageProps): JSX.Element {
  const { translate } = useTranslation();
  const { SystemFeedbackComponent, systemFeedbackService } = useSystemFeedback();
  const { tierInfo, isLoading, isError, isEvaluating, evaluate } = useConfigureCommunityTier(
    groupId
  );

  const runEvaluate = useCallback(async () => {
    const succeeded = await evaluate();
    if (!succeeded) {
      systemFeedbackService.warning(translate('NetworkError'));
    }
  }, [evaluate, systemFeedbackService, translate]);

  const handleStartRequirement = useCallback(
    async (requirementKey: string) => {
      const result = await startRequirementAction(requirementKey);
      if (result.shouldRefresh) {
        await runEvaluate();
      }
    },
    [runEvaluate]
  );

  if (isLoading) {
    return (
      <div className='padding-xlarge flex justify-center'>
        <Loading />
      </div>
    );
  }

  // Only a failed request is unrecoverable here. A null tier means the request
  // succeeded but reported no tier for this community, which the owner can fix by
  // running an evaluation — so keep the page and its button reachable rather than
  // stranding them on an error with no way forward.
  if (isError) {
    return (
      <div className='configure-community-tier padding-xlarge text-body-medium content-default'>
        {translate('NetworkError')}
      </div>
    );
  }

  return (
    <div className='configure-community-tier'>
      <h2 className='text-heading-small content-default'>{translate('Heading.CommunityTier')}</h2>

      {/*
        A staff-assigned tier keeps only the heading: the notice replaces the
        subheading, the Recheck action and the comparison grid, none of which
        describe anything this owner can act on.
      */}
      {tierInfo?.isEnterprise ? (
        <EnterpriseNotice />
      ) : (
        <TierProgress
          tierInfo={tierInfo}
          isEvaluating={isEvaluating}
          onRecheck={runEvaluate}
          onStartRequirement={handleStartRequirement}
        />
      )}
      <SystemFeedbackComponent />
    </div>
  );
}

export default CommunityTierPage;
