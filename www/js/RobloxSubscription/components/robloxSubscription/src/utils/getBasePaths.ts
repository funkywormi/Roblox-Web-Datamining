export const getBEDEV1ServiceBasePath = (rootDomain: string, serviceName: string) => {
  return `https://${serviceName}.${rootDomain}`;
};

export const getBEDEV2ServiceBasePath = (rootDomain: string, serviceName: string) => {
  return `https://apis.${rootDomain}/${serviceName}`;
};
