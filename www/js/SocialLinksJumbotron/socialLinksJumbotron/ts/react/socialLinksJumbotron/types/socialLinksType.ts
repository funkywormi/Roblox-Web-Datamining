export enum TSocialLinkJumbotronType {
  Game = 'Game'
}

export enum TSocialLinkType {
  Facebook = 'Facebook',
  Twitter = 'Twitter',
  Youtube = 'YouTube',
  Twitch = 'Twitch',
  Discord = 'Discord',
  RobloxGroup = 'RobloxGroup',
  Amazon = 'Amazon',
  Guilded = 'Guilded'
}

export type TGetGameSocialLinksResponse = {
  id: number;
  title: string;
  url: string;
  type: TSocialLinkType;
};
