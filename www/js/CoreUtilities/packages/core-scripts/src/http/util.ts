export const retryAttemptHeader =
  document.querySelector<HTMLElement>('meta[name="page-retry-header-enabled"]')?.dataset
    .retryAttemptHeaderEnabled === "True";
