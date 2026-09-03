import { TargetEnvironment } from '@rbx/video-player';

const getCurrentEnvironment = (): TargetEnvironment => {
  const [tld, domain, subdomain] = window.location.hostname.split('.').reverse();

  if (tld != null && domain != null) {
    const root = `${domain}.${tld}`;
    if (root === 'roblox.com' || root === 'simulprod.com' || root === 'rblx.org') {
      return 'production' as TargetEnvironment;
    }

    if (subdomain?.startsWith('sitetest')) {
      return subdomain as TargetEnvironment;
    }
  }

  return 'sitetest3' as TargetEnvironment;
};

export default getCurrentEnvironment;
