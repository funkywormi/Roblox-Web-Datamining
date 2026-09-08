import type { Middleware, ResponseContext } from '@rbx/clients-core';

export const INSECURE_RESPONSE_CODE = 403;

// For every request on organizations service API that involves a secure permissions, we have to pass the isSecure=true parameter.
// If a sensitive permission is updated without this parameter, the request fails with a 403.
// A request with isSecure=true query param is secured with 2FA.
// Since creator hub does not know when this param is needed, we use this middleware to retry the request with the isSecure=true parameter if the first request fails with a 403.
// This middleware is only used for POST and PATCH requests.
export default class SecureRedirectMiddleware implements Middleware {
  post(context: ResponseContext): Promise<Response> {
    const { fetch, url, init, response } = context;
    const Url = new URL(url);

    if (
      (init.method !== 'POST' && init.method !== 'PATCH') ||
      Url.searchParams.get('isSecure') === 'true' ||
      response.status !== INSECURE_RESPONSE_CODE
    ) {
      return Promise.resolve(response);
    }

    Url.searchParams.set('isSecure', 'true');

    return fetch(Url.toString(), init);
  }
}
