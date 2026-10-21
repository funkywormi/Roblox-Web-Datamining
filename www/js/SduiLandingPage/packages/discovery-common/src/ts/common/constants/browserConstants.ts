// Container IDs
export const navigationContainerId = "navigation-container";
export const navigationContainer = (): HTMLElement | null =>
  document.getElementById(navigationContainerId);

// URL Params
export const queryParams = {
  keyword: "keyword",
};

// URL Paths
export const url = {
  sortDetail: (sortName: string): string => `charts/${sortName}`,
  sortDetailV2: (sortName: string): string => `charts/v2/${sortName}`,
};
