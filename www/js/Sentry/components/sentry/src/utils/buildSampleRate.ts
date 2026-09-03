const LOCALE_PREFIX_RE = /^\/[a-z]{2}(?:-[a-z]{2})\//i;

const RegexBasedSamplerSettings: Record<string, { pattern: RegExp; sampleRate: number }> = {
  PreAuthLandingPageRegex: { pattern: /^\/$/i, sampleRate: 1 },
  PaymentTeamPagesRegex: { pattern: /^\/(?:upgrades|redeem)(?:\/|$)/i, sampleRate: 1 },
  SpotlightPageRegex: { pattern: /^\/spotlight\/.*/i, sampleRate: 1 }, // 100% sample rate for spotlight page. Low traffic on page.
};

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);

export function buildSampleRate(baseRate: number) {
  const base = clamp01(baseRate);
  const currrentPathname = window.location.pathname.replace(LOCALE_PREFIX_RE, "/");
  const regexSampleRate = Object.values(RegexBasedSamplerSettings).find(setting =>
    setting.pattern.test(currrentPathname),
  )?.sampleRate;

  if (regexSampleRate !== undefined) {
    return regexSampleRate;
  }

  return base;
}
