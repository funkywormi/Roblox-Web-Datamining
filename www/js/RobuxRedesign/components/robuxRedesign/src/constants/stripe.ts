const DEV_PUBLIC_KEY =
  "pk_test_51LNOeQHDRNiW7vlLcKH8TGCpJ7zhaidLdSegE22GCuvQbVUX2xDiGJY6WYaldYyo6qgVxmy1SnSVpSdaqyjfqclU00NQwWntIe";
const STAGING_PUBLIC_KEY =
  "pk_test_51LNM0XG5RADBkfjhYJlpADA2ArzWIh7gTWTodYNbpEzSiT55dul3VJhaBIVHL0CNyO0gECOz1vPnWArAkjwQ8NBO00Cdf2PxED";
const PROD_PUBLIC_KEY =
  "pk_live_51LKpO9C8tJWGhK4HEHtny9Dg7xXiQJ1i349cq6KBDusbl8bRHO7QmCKKhX18LPjSirMNTvj3tesq6mhIQuPioeAd0062ZCgoF3";

export function getStripePublicAPIKeyForEnv(): string {
  if (window.location.href.includes("sitetest1")) {
    return STAGING_PUBLIC_KEY;
  }
  if (window.location.href.includes("sitetest3")) {
    return DEV_PUBLIC_KEY;
  }

  return PROD_PUBLIC_KEY;
}
