import { EnvironmentUrls } from 'Roblox';

const { apiGatewayUrl } = EnvironmentUrls;

export function getCommunityInfoUrl(universeId: string): string {
  return `${apiGatewayUrl}/community-links/v1/universes/${universeId}/community`;
}

export function getCommunityExternalLinkUrl(communityId: string): string {
  // "a" query param provides attribution source info to Guilded ("red" = "Roblox Experience Details")
  return `${apiGatewayUrl}/community-links/v1/guilded/${communityId}/join?a=red`;
}
