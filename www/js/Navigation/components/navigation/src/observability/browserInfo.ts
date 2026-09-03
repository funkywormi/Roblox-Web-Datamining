export type BrowserFamily = "Chrome" | "Safari" | "Edge" | "Other";

export type BrowserInfo = {
  browserFamily: BrowserFamily;
  browserMajor: string;
};

const parseMajor = (match: RegExpExecArray | null): string => {
  const major = match?.[1];
  if (major == null || major === "") {
    return "Unknown";
  }
  return major.split(".")[0] ?? "Unknown";
};

export const getBrowserInfo = (): BrowserInfo => {
  const userAgent = typeof navigator !== "undefined" ? navigator.userAgent : "";

  const edgeMatch =
    /EdgA?\/(\d+(?:\.\d+)?)/.exec(userAgent) ?? /Edge\/(\d+(?:\.\d+)?)/.exec(userAgent);
  if (edgeMatch) {
    return { browserFamily: "Edge", browserMajor: parseMajor(edgeMatch) };
  }

  const chromeMatch = /(?!Chrom.*OPR)Chrom(?:e|ium)\/(\d+(?:\.\d+)?)/.exec(userAgent);
  if (chromeMatch) {
    return { browserFamily: "Chrome", browserMajor: parseMajor(chromeMatch) };
  }

  // Chrome on iOS sends `CriOS` and no `Chrome` token.
  const chromeIosMatch = /CriOS\/(\d+(?:\.\d+)?)/.exec(userAgent);
  if (chromeIosMatch) {
    return { browserFamily: "Chrome", browserMajor: parseMajor(chromeIosMatch) };
  }

  const safariMatch = /Version\/(\d+(?:[._]\d+)?).*Safari/.exec(userAgent);
  if (safariMatch) {
    return { browserFamily: "Safari", browserMajor: parseMajor(safariMatch) };
  }

  return { browserFamily: "Other", browserMajor: "Unknown" };
};

export const getCredentialCreateBrowserDims = (): {
  browserFamily: BrowserFamily;
  browserMajor: string;
} => {
  const { browserFamily, browserMajor } = getBrowserInfo();
  return {
    browserFamily,
    browserMajor: browserFamily === "Other" ? "Unknown" : browserMajor,
  };
};
