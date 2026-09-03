export const WOFF2_URL_PATTERN = /https:\/\/css\.rbxcdn\.com\/[a-f0-9]+\.woff2/g;

export function extractWoff2UrlsFromBundle(source) {
  return [...new Set(source.match(WOFF2_URL_PATTERN) ?? [])];
}

export function buildFontPreloadHtml(fontUrls) {
  return `${fontUrls
    .map(href => `<link rel="preload" as="font" type="font/woff2" crossorigin href="${href}">`)
    .join("")}\n`;
}
