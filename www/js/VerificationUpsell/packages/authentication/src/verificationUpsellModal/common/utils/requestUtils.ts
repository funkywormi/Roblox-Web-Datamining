type RequestError = { data?: { errors?: { code?: number }[] } } | undefined;

const getErrorCodeFromRequestError = (err: unknown): number | undefined => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  const errors = (err as RequestError)?.data?.errors;
  return errors && errors[0] && errors[0].code;
};
export { getErrorCodeFromRequestError as default };
