let cachedTraceId: string | undefined;

export const STUDIO_TRACE_ID_PARAM = 'studio_trace_id';

export const getTraceIdFromUrl = (): string | undefined => {
  if (cachedTraceId === undefined) {
    const params = new URLSearchParams(window.location.search);
    let traceId = params.get(STUDIO_TRACE_ID_PARAM);

    if (!traceId) {
      const returnUrl = params.get('returnUrl') || params.get('ReturnUrl');
      if (returnUrl) {
        try {
          const returnUrlObj = new URL(returnUrl);
          traceId = returnUrlObj.searchParams.get(STUDIO_TRACE_ID_PARAM);
        } catch {
          // malformed returnUrl, ignore
        }
      }
    }

    cachedTraceId = traceId || '';
  }
  return cachedTraceId || undefined;
};

export const resetTraceIdCache = (): void => {
  cachedTraceId = undefined;
};
