const validBrowsersForWin = ['Chrome', 'Firefox', 'Edge'];
const validBrowsersForMac = ['Chrome', 'Safari', 'Firefox'];

const browserMetaData = {
  Chrome: {
    translationString: 'Label.Chrome',
    iconClassName: 'chrome-icon',
    downloadLink: 'https://support.google.com/chrome/answer/95346?co=GENIE.Platform%3DDesktop&hl=en'
  },
  Firefox: {
    translationString: 'Label.Firefox',
    iconClassName: 'firefox-icon',
    downloadLink: 'https://www.mozilla.org/en-US/firefox/new/'
  },
  Edge: {
    translationString: 'Label.Edge',
    iconClassName: 'msedge-icon',
    downloadLink: 'https://www.microsoft.com/en-us/edge?&OCID=AID2001283_SEM'
  },
  Safari: {
    translationString: 'Label.Safari',
    iconClassName: 'safari-icon',
    downloadLink: 'https://support.apple.com/downloads/safari'
  }
};

export default {
  validBrowsersForMac,
  validBrowsersForWin,
  browserMetaData
};
