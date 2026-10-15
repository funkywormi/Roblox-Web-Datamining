import { httpClient, HttpResponseCodes } from "@rbx/core-scripts/http";
import { hbaUnauthorizedEventName } from "@rbx/www-common/auth";
import { renderSimpleAuth } from "../components/SimpleAuthModal";
import {
  MODAL_CONTAINER_ID,
  MODAL_SIGN_IN_KEY,
  MODAL_BODY_CTA,
  MODAL_TITLE_KEY,
  ERROR_CODE_GENERIC_AUTH,
  ERROR_SUBCODE_GENERIC_HBA,
} from "../constants/modalConstants";

// Create modal container if it does not exist.
const ensureContainer = (): HTMLElement => {
  let container = document.getElementById(MODAL_CONTAINER_ID);
  if (!container) {
    container = document.createElement("div");
    container.id = MODAL_CONTAINER_ID;
    document.body.append(container);
  }
  return container;
};

const showSignInModal = (): void => {
  ensureContainer();
  renderSimpleAuth({
    titleKey: MODAL_TITLE_KEY,
    bodyContextKey: "",
    bodyCtaKey: MODAL_BODY_CTA,
    buttonKey: MODAL_SIGN_IN_KEY,
  });
};

// Check for 401 response and render Auth modal.
const setupAuthInterceptor = (): void => {
  httpClient.interceptors.response.use(
    response => response,
    (error: unknown) => {
      if (
        error != null &&
        typeof error === "object" &&
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        (error as Record<string, unknown>).status === HttpResponseCodes.unauthorized
      ) {
        const { data } = error as {
          data?: { errors?: [{ code?: number; subcode?: number }] };
        };
        const errorCode = data?.errors?.[0]?.code;
        const errorSubcode = data?.errors?.[0]?.subcode;
        if (errorCode === ERROR_CODE_GENERIC_AUTH && errorSubcode === ERROR_SUBCODE_GENERIC_HBA) {
          showSignInModal();
          return new Promise(() => {
            // Promise never resolves or rejects to prevent caller error handlers from running
          });
        }
      }

      // Preserving the error value
      // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
      return Promise.reject(error);
    },
  );
  document.addEventListener(hbaUnauthorizedEventName, event => {
    event.preventDefault();
    showSignInModal();
  });
};

export default setupAuthInterceptor;
