export type DomainInfo = {
  production: boolean;
  domainName: string;
  rootDomain: string;
};

export const getDomainInfo = (hostname: string): DomainInfo => {
  const metaTag = document.querySelector<HTMLElement>('meta[name="environment-meta"]');

  if (metaTag?.dataset.domain) {
    return {
      production: metaTag.dataset.isTestingSite === "false",
      // `split` can return a empty array only if separator is "".
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      domainName: metaTag.dataset.domain.split(".")[0]!,
      rootDomain: metaTag.dataset.domain,
    };
  }

  if (hostname === "localhost") {
    return {
      production: false,
      domainName: "sitetest3",
      rootDomain: "sitetest3.robloxlabs.com",
    };
  }

  const [tld, domain, subdomain] = hostname.split(".").reverse();

  if (tld != null && domain != null) {
    const root = `${domain}.${tld}`;
    if (root === "roblox.com" || root === "simulprod.com" || root === "rblx.org") {
      return {
        production: true,
        domainName: "roblox",
        rootDomain: "roblox.com",
      };
    }

    if (subdomain?.startsWith("sitetest")) {
      return {
        production: false,
        domainName: subdomain,
        rootDomain: `${subdomain}.robloxlabs.com`,
      };
    }
  }

  throw new Error(`Unknown environment for ${hostname}`);
};
