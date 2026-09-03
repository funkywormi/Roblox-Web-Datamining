const seconds = Math.floor(new Date().getTime() / 1000);

interface NonceConfig {
  guac: { counter: number; nonce: string };
}

const getNonce = (counter: number) => `v${counter}_${seconds}`;

const registeredNonces: NonceConfig = {
  guac: { counter: 0, nonce: getNonce(0) }
};

export const updateNonce = (service: keyof NonceConfig): void => {
  registeredNonces[service].counter += 1;
  registeredNonces[service].nonce = getNonce(registeredNonces[service].counter);
};

export const updateGuacNonce = (): void => updateNonce('guac');

export const getRequestCacheBustParams = (service: keyof NonceConfig): URLSearchParams => {
  // cCB = community cache bust: this is made up, its a cacheBusting parameter
  return new URLSearchParams([['cCB', registeredNonces[service].nonce]]);
};

export const getGuacRequestCacheBustParams = (): URLSearchParams =>
  getRequestCacheBustParams('guac');
