import { getToken, setToken } from "@rbx/core-scripts/auth/xsrfToken";

const CSRF_TOKEN_HEADER = "X-CSRF-TOKEN";
const CSRF_INVALID_RESPONSE_CODE = 403;

const fetchWrapper = (url: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const token = getToken();
  const { headers, ...restInit } = init ?? {};

  const mergedHeaders: HeadersInit = {
    ...Object.fromEntries(new Headers(headers)),
    [CSRF_TOKEN_HEADER]: token,
  };

  // eslint-disable-next-line
  return fetch(url, {
    ...restInit,
    headers: mergedHeaders,
  });
};

export const fetchWithCsrf = async (
  url: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> => {
  let response = await fetchWrapper(url, init);
  // Handle CSRF token refresh on 403 (same logic as httpService)
  if (response.status === CSRF_INVALID_RESPONSE_CODE) {
    const newToken = response.headers.get(CSRF_TOKEN_HEADER);
    if (newToken) {
      setToken(newToken);
      // Retry with new token
      response = await fetchWrapper(url, init);
    }
  }
  return response;
};
