import React from 'react';
import { Button, Icon } from '@rbx/foundation-ui';
import { useTranslation } from 'react-utilities';
import { SUPPORT_TICKET_ICON_FILLED_BUG } from '../../types/supportTicket';

export type SupportTicketAttachmentPillProps = {
  onEdit: () => void;
  onRemove: () => void;
};

const SupportTicketAttachmentPill = ({
  onEdit,
  onRemove
}: SupportTicketAttachmentPillProps): JSX.Element => {
  const { translate } = useTranslation();

  return (
    <div className='post-composer-support-ticket-pill' data-testid='support-ticket-attachment-pill'>
      <Button
        variant='Standard'
        size='XSmall'
        className='support-ticket-attachment-chip'
        onClick={onEdit}>
        <span className='flex items-center gap-xsmall'>
          <Icon name={SUPPORT_TICKET_ICON_FILLED_BUG} size='XSmall' />
          <span>{translate('Label.SupportTicket')}</span>
          <Icon
            className='content-default hover:content-emphasis'
            name='icon-regular-x'
            size='XSmall'
            data-testid='support-ticket-attachment-pill-remove'
            aria-label={translate('Action.RemoveTicket')}
            onClick={event => {
              event.stopPropagation();
              onRemove();
            }}
          />
        </span>
      </Button>
    </div>
  );
};

SupportTicketAttachmentPill.displayName = 'SupportTicketAttachmentPill';

export default SupportTicketAttachmentPill;
