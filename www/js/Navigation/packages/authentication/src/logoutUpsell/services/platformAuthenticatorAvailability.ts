type PublicKeyCredentialStatics = {
  isUserVerifyingPlatformAuthenticatorAvailable?: () => Promise<boolean>;
  getClientCapabilities?: () => Promise<Record<string, boolean | undefined> | null | undefined>;
};

const CHECK_TIMEOUT_MS = 1000;

const checkIuvpaa = async (api: PublicKeyCredentialStatics): Promise<boolean | undefined> => {
  const run = api.isUserVerifyingPlatformAuthenticatorAvailable;
  if (typeof run !== "function") {
    return undefined;
  }
  try {
    return await run.call(api);
  } catch {
    return undefined;
  }
};

const checkClientCapabilities = async (
  api: PublicKeyCredentialStatics,
): Promise<boolean | undefined> => {
  const run = api.getClientCapabilities;
  if (typeof run !== "function") {
    return undefined;
  }
  try {
    const capabilities = await run.call(api);
    if (capabilities == null) {
      return undefined;
    }
    return [
      capabilities.passkeyPlatformAuthenticator,
      capabilities.userVerifyingPlatformAuthenticator,
    ].includes(true);
  } catch {
    return undefined;
  }
};

const resolveAvailability = (checks: Array<Promise<boolean | undefined>>): Promise<boolean> =>
  new Promise(resolve => {
    let remaining = checks.length;
    let sawFalse = false;

    checks.forEach(check => {
      check
        .then(outcome => {
          if (outcome === true) {
            resolve(true);
            return;
          }
          sawFalse = sawFalse || outcome === false;
          remaining -= 1;
          if (remaining === 0) {
            resolve(!sawFalse);
          }
        })
        .catch(() => resolve(true));
    });
  });

export const isPlatformAuthenticatorAvailable = async (): Promise<boolean> => {
  if (typeof PublicKeyCredential === "undefined") {
    return false;
  }

  const api: PublicKeyCredentialStatics = PublicKeyCredential;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<boolean>(resolve => {
    // Fail open when browser capability APIs do not settle.
    timer = setTimeout(resolve, CHECK_TIMEOUT_MS, true);
  });
  const verdict = resolveAvailability([checkIuvpaa(api), checkClientCapabilities(api)]);

  try {
    return await Promise.race([verdict, timeout]);
  } finally {
    clearTimeout(timer);
  }
};
