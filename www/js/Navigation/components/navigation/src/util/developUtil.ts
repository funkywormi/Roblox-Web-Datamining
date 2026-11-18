import environmentUrls from "@rbx/environment-urls";

const developLinkMdContainerId = "header-develop-md-link";
const developLinkSmContainerId = "header-develop-sm-link";

// Alternate domains without a create host (traffic-consul-sync education_domains.map).
const domainsWithoutCreate = ["robloxapp.vnggames.com"];

export const getDevelopUrl = () => {
  const { domain } = environmentUrls;
  return `https://create.${domainsWithoutCreate.includes(domain) ? "roblox.com" : domain}/`;
};

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
