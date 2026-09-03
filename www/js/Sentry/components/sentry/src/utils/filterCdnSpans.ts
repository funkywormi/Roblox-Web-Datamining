import type { BrowserOptions } from "@sentry/browser";

type BeforeSendTransactionCallback = NonNullable<BrowserOptions["beforeSendTransaction"]>;
export type Transaction = Parameters<BeforeSendTransactionCallback>[0];

const CDN_DOMAINS = [
  "css.rbxcdn.com",
  "static.rbxcdn.com",
  "js.rbxcdn.com",
  "tr.rbxcdn.com",
  "metrics.roblox.com",
  "images.rbxcdn.com",
];

const FONT_EXTENSIONS = [".woff2", ".woff"] as const;

function isCssCdnFontUrl(url: string): boolean {
  if (!url.includes("css.rbxcdn.com")) {
    return false;
  }

  try {
    const pathname = new URL(url).pathname.toLowerCase();
    return FONT_EXTENSIONS.some(ext => pathname.endsWith(ext));
  } catch {
    return /\.woff2?(?:[?#]|$)/i.test(url);
  }
}

function shouldFilterCdnSpan(url: string): boolean {
  if (isCssCdnFontUrl(url)) {
    return false;
  }

  return CDN_DOMAINS.some(domain => url.includes(domain));
}

/**
 * Filters out spans from CDN domains to reduce noise in Sentry traces.
 * This function removes network request spans (http.client, resource.*) that
 * target specified CDN domains, except font files served from css.rbxcdn.com.
 *
 * @param transaction - The Sentry transaction to filter
 * @returns The transaction with CDN spans filtered out
 */
export function filterCdnSpans(transaction: Transaction): Transaction {
  if (!transaction.spans) {
    return transaction;
  }

  const filteredSpans = transaction.spans.filter(span => {
    // Check if this is a network request span
    if (span.op === "http.client" || span.op?.startsWith("resource.")) {
      const url = span.description ?? span.data.url;
      if (typeof url === "string") {
        return !shouldFilterCdnSpan(url);
      }
    }
    return true;
  });

  return {
    ...transaction,
    spans: filteredSpans,
  };
}
