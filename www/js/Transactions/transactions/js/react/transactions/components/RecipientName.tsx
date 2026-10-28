import React, { FunctionComponent } from 'react';
import { Link } from 'react-style-guide';
import { Agent, urlService } from '../../../../ts';

interface RecipientNameProps {
  recipient?: Agent | null;
}

/**
 * The gift recipient's name, linked to their profile.
 *
 * Mirrors {@link ItemName}: the same `urlService` helper that links the counterparty in the Source
 * column (see MemberComponent) builds the href, so the recipient is clickable for the same reason
 * every other named entity in a row is. Rendering through React also escapes the name, which
 * matters because the caller injects the result with `dangerouslySetInnerHTML` -- a display name is
 * moderated, but that is not an escaping guarantee.
 *
 * Falls back to plain text when no URL can be built, rather than dropping the name.
 */
const RecipientName: FunctionComponent<RecipientNameProps> = ({ recipient }) => {
  if (!recipient?.name) {
    return null;
  }

  const profileUrl = urlService.getAgentProfileUrl(recipient);

  return profileUrl ? (
    <Link url={profileUrl} className='text-link text-overflow'>
      {recipient.name}
    </Link>
  ) : (
    <span className='text-overflow'>{recipient.name}</span>
  );
};

export default RecipientName;
