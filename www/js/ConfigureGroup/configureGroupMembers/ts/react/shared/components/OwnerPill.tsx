import React from 'react';
import { Badge } from '@rbx/foundation-ui';
import { useTranslation } from 'react-utilities';

type OwnerPillProps = {
  /** Forwarded to the underlying Badge for surface-specific spacing. */
  className?: string;
};

/**
 * Presentational "Owner" badge. Renders whenever mounted -- the decision whether to show it
 * lives in `useIsCommunityOwner(userId, groupId)` at the call site:
 *
 *   const isOwner = useIsCommunityOwner(user.userId, groupId);
 *   return <>{name} {isOwner && <OwnerPill />}</>;
 */
const OwnerPill: React.FC<OwnerPillProps> = ({ className }) => {
  const { translate } = useTranslation();
  return <Badge variant='Neutral' label={translate('Label.Owner')} className={className} />;
};

export default OwnerPill;
