import environmentUrls from "@rbx/environment-urls";

const developLinkMdContainerId = "header-develop-md-link";
const developLinkSmContainerId = "header-develop-sm-link";

export const initializeDevelopLink = () => {
  const developLinkMd = document.getElementById(developLinkMdContainerId);
  const developLinkSm = document.getElementById(developLinkSmContainerId);
  if (developLinkMd instanceof HTMLAnchorElement) {
    developLinkMd.href = `https://create.${environmentUrls.domain}/`;
  }

  if (developLinkSm instanceof HTMLAnchorElement) {
    developLinkSm.href = `https://create.${environmentUrls.domain}/`;
  }
};
