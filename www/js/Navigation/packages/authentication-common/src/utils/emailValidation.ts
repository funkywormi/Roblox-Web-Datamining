/**
 * Lightweight client-side email shape check. The authoritative validation
 * lives server-side in the account-settings API
 * (`EmailErrorCode.InvalidEmail`), which the caller should surface to the user
 * when the POST fails.
 */
export const validateEmailAddress = (email: string): boolean => {
  const re = /\S+@\S+\.\S+/;
  return re.test(email);
};

export default validateEmailAddress;
