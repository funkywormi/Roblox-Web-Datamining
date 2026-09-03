import { EnvironmentUrls } from 'Roblox';
import { seoName } from 'core-utilities';
import TransactionItemType from '../enums/TransactionItemType';
import TransactionItem from '../interfaces/TransactionItem';
import Agent from '../interfaces/Agent';
import AgentType from '../enums/AgentType';

const { websiteUrl } = EnvironmentUrls;

function getItemUrl(item: TransactionItem): string | null {
  if (!item) return null;
  switch (item.type) {
    case TransactionItemType.Asset:
      // Paid-access games are returned as Asset but are really places. /catalog/{id} no
      // longer redirects to /games/{id}, so link to the experience page when place details
      // are present; otherwise fall back to the catalog page for ordinary assets.
      if (item.place && item.place.placeId) {
        return `${websiteUrl}/games/${item.place.placeId}/${seoName.formatSeoName(
          item.place.name
        )}`;
      }
      return `${websiteUrl}/catalog/${item.id}/${seoName.formatSeoName(item.name)}`;
    case TransactionItemType.GamePass:
      return `${websiteUrl}/game-pass/${item.id}/${seoName.formatSeoName(item.name)}`;
    case TransactionItemType.Bundle:
      return `${websiteUrl}/bundles/${item.id}/${seoName.formatSeoName(item.name)}`;
    case TransactionItemType.DeveloperProduct:
    case TransactionItemType.PrivateServer:
    case TransactionItemType.Place:
      if (item.place) {
        return `${websiteUrl}/games/${item.place.placeId}/${seoName.formatSeoName(
          item.place.name
        )}`;
      }
      return null;
    default:
      return null;
  }
}

function getPlaceUrl(item: TransactionItem): string | null {
  if (!item) return null;
  if (item.place && item.place.placeId && item.place.name) {
    return `${websiteUrl}/games/${item.place.placeId}/${seoName.formatSeoName(item.place.name)}`;
  }
  return null;
}

function getAgentProfileUrl(agent: Agent): string | null {
  if (!agent) return null;
  switch (agent.type) {
    case AgentType.Group:
      return `${websiteUrl}/groups/${agent.id}/${seoName.formatSeoName(agent.name)}#!/about`;
    case AgentType.User:
    default:
      return `${websiteUrl}/users/${agent.id}/profile`;
  }
}

export default {
  getItemUrl,
  getPlaceUrl,
  getAgentProfileUrl
};
