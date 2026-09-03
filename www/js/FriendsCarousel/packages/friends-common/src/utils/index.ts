export const getUrlUserId = (): string | null => {
  const reg = /\/users\/(\d+)\//g;
  const match = reg.exec(window.location.pathname);
  return match?.[1] ?? null;
};
