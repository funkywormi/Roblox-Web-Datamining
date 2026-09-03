import React from 'react';
import { Button } from '@rbx/foundation-ui';
import { TierRequirement } from '../../shared/communityTier/types';
import { isActionableRequirement } from '../../shared/communityTier/requirementActions';

type RequirementActionButtonProps = {
  requirement: TierRequirement;
  startLabel: string;
  onStart: (requirementKey: string) => void;
};

function RequirementActionButton({
  requirement,
  startLabel,
  onStart
}: RequirementActionButtonProps): JSX.Element | null {
  if (requirement.isMet || !isActionableRequirement(requirement.requirementKey)) {
    return null;
  }

  return (
    <Button variant='SoftEmphasis' size='Small' onClick={() => onStart(requirement.requirementKey)}>
      {startLabel}
    </Button>
  );
}

export default RequirementActionButton;
