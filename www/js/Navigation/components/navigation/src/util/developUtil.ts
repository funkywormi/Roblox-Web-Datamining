import environmentUrls from "@rbx/environment-urls";

const developLinkMdContainerId = "header-develop-md-link";
const developLinkSmContainerId = "header-develop-sm-link";

export const getDevelopUrl = () => `https://create.${environmentUrls.domain}/`;

export const initializeDevelopLink = () => {
  const developLinkMd = document.getElementById(developLinkMdContainerId);
  const developLinkSm = document.getElementById(developLinkSmContainerId);
  if (developLinkMd instanceof HTMLAnchorElement) {
    developLinkMd.href = getDevelopUrl();
  }

  if (developLinkSm instanceof HTMLAnchorElement) {
    developLinkSm.href = getDevelopUrl();
  }
};
