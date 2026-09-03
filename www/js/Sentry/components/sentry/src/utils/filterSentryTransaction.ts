import type { BrowserOptions } from "@sentry/browser";
import { IGNORED_RESOURCE_SPAN_OPS, shouldTraceHttpRequest } from "./browserTracingSpanConfig";
import { filterCdnSpans } from "./filterCdnSpans";

type BeforeSendTransactionCallback = NonNullable<BrowserOptions["beforeSendTransaction"]>;
export type Transaction = Parameters<BeforeSendTransactionCallback>[0];

const IGNORED_RESOURCE_SPAN_OP_SET = new Set<string>(IGNORED_RESOURCE_SPAN_OPS);

function getSpanUrl(span: NonNullable<Transaction["spans"]>[number]): string | undefined {
  const url = span.description ?? span.data.url;
  return typeof url === "string" ? url : undefined;
}

/** Drop http.client spans not on the Sentry opt-in allowlist. */
export function filterHttpClientSpansForSentry(transaction: Transaction): Transaction {
  if (!transaction.spans) {
    return transaction;
  }

  const filteredSpans = transaction.spans.filter(span => {
    if (span.op !== "http.client") {
      return true;
    }

    const url = getSpanUrl(span);
    if (url == null) {
      return true;
    }

    return shouldTraceHttpRequest(url);
  });

  return {
    ...transaction,
    spans: filteredSpans,
  };
}

/** Drop high-volume static resource spans from Sentry (still exported to OTEL). */
export function filterIgnoredResourceSpansForSentry(transaction: Transaction): Transaction {
  if (!transaction.spans) {
    return transaction;
  }

  const filteredSpans = transaction.spans.filter(span => {
    return span.op == null || !IGNORED_RESOURCE_SPAN_OP_SET.has(span.op);
  });

  return {
    ...transaction,
    spans: filteredSpans,
  };
}

/**
 * Filters a transaction before Sentry ingest. OTEL should receive the unfiltered
 * event first so it retains full http.client and resource span detail.
 */
export function filterSentryTransaction(transaction: Transaction): Transaction {
  return filterCdnSpans(
    filterIgnoredResourceSpansForSentry(filterHttpClientSpansForSentry(transaction)),
  );
}
