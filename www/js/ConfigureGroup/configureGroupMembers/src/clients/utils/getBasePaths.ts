export function getBEDEV1ServiceBasePath(serviceName: string) {
  return `https://${serviceName}.${process.env.bedev1BaseDomain}`;
}

export function getBEDEV2ServiceBasePath(serviceName: string) {
  return `${process.env.bedev2BaseUrl}/${serviceName}`;
}
