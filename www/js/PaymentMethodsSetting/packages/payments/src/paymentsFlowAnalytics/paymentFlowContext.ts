import { delete as deleteCookie, get, set } from "@rbx/core-lib/cookie";
import { isStringEnum } from "@rbx/core-lib";
import environmentUrls from "@rbx/environment-urls";
import "@rbx/www-common/global";
import {
  COOKIE_NAME,
  COOKIE_TIMESPAN,
  TRIGGERING_CONTEXT,
  type TriggeringContext,
} from "./constants";
import { isBrowser } from "./isBrowser";

const cookieOptions = (): { readonly domain: string; readonly maxAge: number } => ({
  domain: `.${environmentUrls.domain}`,
  maxAge: COOKIE_TIMESPAN,
});

export class PaymentFlowContext {
  public purchaseFlowUuid?: string;

  public triggeringContext?: TriggeringContext;

  constructor(purchaseFlowUuid?: string, triggeringContext?: TriggeringContext) {
    this.purchaseFlowUuid = purchaseFlowUuid;
    this.triggeringContext = triggeringContext;
  }

  public save(): void {
    if (!isBrowser()) {
      return;
    }
    const flowCtx = `${this.purchaseFlowUuid ?? ""},${this.triggeringContext ?? ""}`;
    const { domain, maxAge } = cookieOptions();
    set(COOKIE_NAME, flowCtx, { domain, maxAge });
  }

  public static stop(): void {
    if (!isBrowser()) {
      return;
    }
    const { domain } = cookieOptions();
    deleteCookie(COOKIE_NAME, { domain });
  }

  public static loadFromCookie(): PaymentFlowContext | null {
    if (!isBrowser()) {
      return null;
    }
    const cookie = get(COOKIE_NAME);
    if (cookie == null || cookie.value === "") {
      return null;
    }
    const [uuid, context] = cookie.value.split(",");
    const purchaseFlowUuid = uuid === "" ? undefined : uuid;
    const triggerContext =
      context != null && isStringEnum(TRIGGERING_CONTEXT, context) ? context : undefined;
    return new PaymentFlowContext(purchaseFlowUuid, triggerContext);
  }
}
