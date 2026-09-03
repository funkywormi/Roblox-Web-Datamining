export type TGameMetadata = {
  pageId?: string;
  placeId?: string;
  rootPlaceId?: string;
  placeName?: string;
  privateServerLimit?: string;
  privateServerPrice?: string;
  privateServerLinkCode?: string;
  universeId?: string;
  gameInstanceId?: string;
  showShutDownAllButton?: boolean;
  userCanManagePlace?: boolean;
  canCreateServer?: boolean;
  experienceInviteLinkId?: string;
  experienceInviteStatus?: string;
};

const gameDetailsMetadataContainerId = 'game-detail-meta-data';
const gameDetailsMetadataContainer = (): HTMLElement | null =>
  document.getElementById(gameDetailsMetadataContainerId);
const gameMetadataData = (): TGameMetadata => {
  const data = gameDetailsMetadataContainer()?.dataset || {};
  const parsedData = Object.keys(data).reduce<Record<string, string | boolean | undefined>>((acc, curr) => {
    const value = (data[curr] as string).toLowerCase();
    if (value === 'true') {
      acc[curr] = true;
    } else if (value === 'false') {
      acc[curr] = false;
    } else {
      acc[curr] = data[curr];
    }
    return acc;
  }, {});
  return parsedData;
};

export default {
  gameDetailsMetadataContainerId,
  gameDetailsMetadataContainer,
  gameMetadataData
};
