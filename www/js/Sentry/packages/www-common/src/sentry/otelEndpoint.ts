const DEFAULT_SITE_TEST = "sitetest3";
const PROD_OTEL_ENDPOINT = "https://tracing.roblox.com/v1/traces";
const DEFAULT_OTEL_ENDPOINT = "https://otel-collector-otlp-http-sitetest3.simulpong.com/v1/traces";

const SITE_TEST_OTEL_ENDPOINTS: Record<string, string> = {
  sitetest1: "https://otel-collector-otlp-http-sitetest1-snc3.simulpong.com/v1/traces",
  sitetest2: "https://otel-collector-otlp-http-sitetest2-snc2.simulpong.com/v1/traces",
  sitetest3: DEFAULT_OTEL_ENDPOINT,
};

type EnvironmentMeta = {
  domain?: string;
  isTestingSite?: string;
};

type DomainInfo = {
  production: boolean;
  domainName: string;
};

export function getDomainInfo(hostname: string, environmentMeta?: EnvironmentMeta): DomainInfo {
  const metaDomain = environmentMeta?.domain;
  if (metaDomain != null) {
    const [rawDomainName] = metaDomain.split(".");
    const domainName = rawDomainName?.trim().toLowerCase();
    return {
      production: environmentMeta?.isTestingSite === "false",
      domainName: domainName != null && domainName.length > 0 ? domainName : DEFAULT_SITE_TEST,
    };
  }

  if (hostname === "localhost") {
    return { production: false, domainName: DEFAULT_SITE_TEST };
  }

  const hostnameParts = hostname.toLowerCase().split(".");
  const rootDomain = hostnameParts.slice(-2).join(".");
  const sitetestSegment = hostnameParts.find(part => part.startsWith("sitetest"));

  if (rootDomain === "roblox.com" || rootDomain === "simulprod.com" || rootDomain === "rblx.org") {
    return { production: true, domainName: "roblox" };
  }

  if (sitetestSegment != null) {
    return { production: false, domainName: sitetestSegment };
  }

  return { production: false, domainName: DEFAULT_SITE_TEST };
}

export function getOtelCollectorTracesEndpoint(
  hostname: string,
  environmentMeta?: EnvironmentMeta,
): string {
  const { production, domainName } = getDomainInfo(hostname, environmentMeta);
  if (production) {
    return PROD_OTEL_ENDPOINT;
  }

  return SITE_TEST_OTEL_ENDPOINTS[domainName.toLowerCase()] ?? DEFAULT_OTEL_ENDPOINT;
}
