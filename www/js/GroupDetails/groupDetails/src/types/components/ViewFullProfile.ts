export interface ViewFullProfile {
  userId: number;
  type?: ViewFullProfileType;
}

export enum ViewFullProfileType {
  Profile = 'Profile',
  Community = 'Community'
}
