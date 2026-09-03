import React from 'react';
import { useTranslation } from 'react-utilities';

/**
 * Stands in for everything below the page heading on a community whose tier
 * Roblox staff assigned.
 *
 * Enterprise is granted rather than earned, so there are no requirements left to
 * complete, no capabilities to unlock and nothing for an evaluation to change:
 * the comparison grid and its Recheck action would only describe work the owner
 * cannot do. The notice says who set the tier and where to ask about it instead.
 */
function EnterpriseNotice(): JSX.Element {
  const { translate } = useTranslation();

  return (
    <div className='configure-community-tier__notice margin-top-small text-body-medium content-default'>
      {translate('Description.CommunityTierEnterprise')}
    </div>
  );
}

export default EnterpriseNotice;
