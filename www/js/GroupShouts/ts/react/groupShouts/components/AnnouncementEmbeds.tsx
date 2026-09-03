import React from 'react';
import groupAnnouncementsConstants from '../constants/groupAnnouncementsConstants';
import MarketplaceItemEmbed from './MarketplaceItemEmbed';

export type AnnouncementEmbedsProps = {
  content: string;
  groupId: number;
};

function getMarketplaceItemId(content: string): number | undefined {
  // Get the first URL that matches a catalog item URL and use that to display the embed
  const regex = new RegExp(groupAnnouncementsConstants.embedUrlRegexes.catalogItem);
  const match = regex.exec(content);
  if (match) {
    return parseInt(match[2], 10);
  }
  return undefined;
}

const AnnouncementEmbeds = ({ content, groupId }: AnnouncementEmbedsProps): JSX.Element | null => {
  const marketplaceItemId = getMarketplaceItemId(content);
  return marketplaceItemId ? (
    <div className='announcement-display-embed-row'>
      <MarketplaceItemEmbed id={marketplaceItemId} groupId={groupId} />
    </div>
  ) : null;
};
export default AnnouncementEmbeds;
