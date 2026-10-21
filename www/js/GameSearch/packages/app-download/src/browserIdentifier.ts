function isAmazonTablet(userAgent: string) {
  const amazonTabletRegex =
    /Kindle|Silk|KFAPW|KFARWI|KFASWI|KFFOWI|KFJW|KFMEWI|KFOT|KFSAW|KFSOWI|KFTBW|KFTHW|KFTT|WFFOWI|KFAPWI/i;
  return amazonTabletRegex.test(userAgent);
}

function isFirefox(userAgent: string) {
  return userAgent.toLowerCase().includes("firefox");
}

function isChrome() {
  return typeof window !== "undefined" && "chrome" in window;
}

function isSafari() {
  return (
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    /apple/i.exec(navigator.vendor) &&
    !/crios/i.exec(navigator.userAgent) &&
    !/fxios/i.exec(navigator.userAgent) &&
    !/Opera|OPT\//.exec(navigator.userAgent)
  );
}

function isEdge() {
  return window.navigator.userAgent.includes("Edge/");
}

export default {
  isEdge,
  isSafari,
  isChrome,
  isFirefox,
  isAmazonTablet,
};
