import { getDomainInfo, type EnvironmentMeta } from "@rbx/www-common/sentry/otelEndpoint";

const PROD_DSN = "https://bcafd66a36fdc3df18b1666ccfdbfaec@sentry-relay.rbx.com/21";
const SITETEST_DSN = "https://ee6f913759705f6d51358229e4278e56@sentry.stage.rbx.com/24";

export const getSelfHostedDsn = (hostname: string, environmentMeta?: EnvironmentMeta): string => {
  const { production } = getDomainInfo(hostname, environmentMeta);
  return production ? PROD_DSN : SITETEST_DSN;
};
