import React, { FunctionComponent, useState } from 'react';
import { TranslateFunction } from 'react-utilities';
import { FeedbackBanner } from '@rbx/foundation-ui';
import { getCreatorHubTransactionsUrl } from '../utils/urlHelper';

export interface CreatorHubTransactionsBannerProps {
  translate: TranslateFunction;
  // The Creator Hub link carries whichever context is set so the destination opens scoped to it
  // instead of restoring the visitor's last-selected creator there. Exactly one is expected:
  // `groupId` in a group context, `userId` in the personal context.
  groupId?: number;
  userId?: number;
}

// Announcement banner pointing creators to their transactions on Creator Hub.
// Rendering is gated by the caller behind the isCreatorHubTransactionsBannerEnabled flag.
const CreatorHubTransactionsBanner: FunctionComponent<CreatorHubTransactionsBannerProps> = ({
  translate,
  groupId,
  userId
}) => {
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  if (isDismissed) {
    return null;
  }

  return (
    <FeedbackBanner
      className='margin-y-small'
      title={translate('Description.AccessThroughCreatorHub')}
      linkLabel={translate('Description.GoToCreatorHubTransactions', {
        linkStart: '',
        linkEnd: ''
      })}
      linkHref={getCreatorHubTransactionsUrl(groupId, userId)}
      severity='Info'
      variant='Emphasis'
      onDismiss={() => setIsDismissed(true)}
    />
  );
};

export default CreatorHubTransactionsBanner;
