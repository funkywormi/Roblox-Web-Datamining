export function extractWoff2UrlsFromBundle(source) {
  return [...new Set(source.match(/https:\/\/[a-zA-Z-_0-9./]+\.woff2/g) ?? [])];
}

export function buildFontPreloadHtml(fontUrls) {
  return `${fontUrls
    .map(href => `<link rel="preload" as="font" type="font/woff2" crossorigin href="${href}">`)
    .join("")}\n`;
}
