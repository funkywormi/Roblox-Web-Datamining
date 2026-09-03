import { TargetEnvironment } from "@rbx/video-player";

const getCurrentEnvironment = (): TargetEnvironment => {
  const [tld, domain, subdomain] = window.location.hostname.split(".").reverse();

  if (tld != null && domain != null) {
    const root = `${domain}.${tld}`;
    if (root === "roblox.com") {
      return "production";
    }

    if (subdomain?.startsWith("sitetest")) {
      if (subdomain === "sitetest3") {
        return "sitetest3";
      }
      if (subdomain === "sitetest2") {
        return "sitetest2";
      }
      if (subdomain === "sitetest1") {
        return "sitetest1";
      }
    }
  }

  return "sitetest3";
};

export default getCurrentEnvironment;
