export enum QuickLink {
  Favorites = 'Favorites',
  Inventory = 'Inventory',
  Groups = 'Groups',
  Badges = 'Badges'
}

export interface QuickLinks {
  links: QuickLink[];
}
