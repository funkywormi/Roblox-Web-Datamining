import React from 'react';
import classNames from 'classnames';
import { Icon, Tooltip, TooltipTrigger } from '@rbx/foundation-ui';
import { useTranslation } from 'react-utilities';
import { CurrentUser } from 'Roblox';
import groupForumsConstants from '../../constants/groupForumsConstants';
import {
  SUPPORT_TICKET_ICON_FILLED_BUG,
  SupportTicketAttachment,
  getSupportTicketStatusDisplay,
  hasDisplayableSupportTicketStatus
} from '../../types/supportTicket';

export const POST_PREVIEW_TICKET_STATUS_CLASS = 'group-forums-post-preview-ticket-status';

export type SupportTicketStatusPillProps = {
  supportTicket: SupportTicketAttachment;
  groupId: number;
  categoryShortId: string;
  postShortId: string;
  postAuthorId: number;
};

const SupportTicketStatusPill = ({
  supportTicket,
  groupId,
  categoryShortId,
  postShortId,
  postAuthorId
}: SupportTicketStatusPillProps): JSX.Element | null => {
  const { translate } = useTranslation();
  const { status, ticketId, universeId } = supportTicket;
  const statusDisplay = getSupportTicketStatusDisplay(status);

  // Show the frame only for a reconciled ticket with a recognized, displayable status. An empty
  // ticketId (unreconciled) or an `Invalid`/unknown status (e.g. the backend couldn't resolve a live
  // status on fetch) yields no label.
  if (!ticketId || !statusDisplay) {
    return null;
  }

  // Always deep-link with the forum post as `sourceId`; the support center shows the author their
  // ticket and redirects a non-author home with a "back to the forum post" banner.
  const deepLinkUrl = groupForumsConstants.urls.getSupportCenterTicketUrl(
    universeId,
    ticketId,
    `${groupId}_${categoryShortId}_${postShortId}`
  );
  const pill = (
    <a
      className={classNames(POST_PREVIEW_TICKET_STATUS_CLASS, statusDisplay.colorClass)}
      data-testid='support-ticket-status-pill'
      href={deepLinkUrl}>
      <Icon name={SUPPORT_TICKET_ICON_FILLED_BUG} size='XSmall' />
      <span className='group-forums-post-preview-ticket-status-label'>
        {translate(statusDisplay.labelKey)}
      </span>
    </a>
  );

  return Number(CurrentUser.userId) === postAuthorId ? (
    <Tooltip position='top-center' title={translate('Label.SupportTicketStatusViewTooltip')}>
      <TooltipTrigger asChild>{pill}</TooltipTrigger>
    </Tooltip>
  ) : (
    pill
  );
};

SupportTicketStatusPill.displayName = 'SupportTicketStatusPill';

// Lets `UserDisplay` gate its leading separator on `metaTrailing != null`,
// so call sites don't need a displayability check.
export const renderPostAuthorTicketStatus = (
  supportTicket: SupportTicketAttachment | null | undefined,
  groupId: number,
  categoryShortId: string,
  postShortId: string,
  postAuthorId: number
): React.ReactNode =>
  hasDisplayableSupportTicketStatus(supportTicket) ? (
    <SupportTicketStatusPill
      supportTicket={supportTicket}
      groupId={groupId}
      categoryShortId={categoryShortId}
      postShortId={postShortId}
      postAuthorId={postAuthorId}
    />
  ) : null;

export default SupportTicketStatusPill;
