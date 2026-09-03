import environmentUrls from "@rbx/environment-urls";

export const getRefreshSessionUrl = (): string => `${environmentUrls.authApi}/v2/session/refresh`;
