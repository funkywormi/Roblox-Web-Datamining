export const AppPage = {
  Communities: "Communities",
  Home: "Home",
  ProfilePlatform: "ProfilePlatform",
} as const;

export type AppPage = (typeof AppPage)[keyof typeof AppPage];
