// Copied from apps/creator-hub/modules/clients/utils/getResponseFromError.ts, which packages
// cannot import.

export default function getResponseFromError(e: unknown) {
  if (e && typeof e === 'object' && 'response' in e) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- duck-typed thrown ResponseError
    return e.response as Response;
  }

  if (e && typeof e === 'object' && 'json' in e) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- duck-typed thrown Response
    return e as Response;
  }

  return null;
}
