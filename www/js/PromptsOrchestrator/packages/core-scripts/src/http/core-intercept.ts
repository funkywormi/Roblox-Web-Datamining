import { arrayIncludes } from "@rbx/core-lib";
import Intl from "@rbx/core-scripts/intl";
import { authenticatedUser } from "@rbx/core-scripts/meta/user";
import { setClientInterceptors } from "@rbx/www-common/http";
import { defaultLocale, locales } from "@rbx/www-common/locale";
import { userIdFromNumber } from "@rbx/www-common/user";

const getUserId = () => {
  const id = authenticatedUser()?.id;
  return id == null ? null : userIdFromNumber(id);
};

const getLocale = () => {
  const locale = new Intl().getLocale();
  return arrayIncludes(locales, locale) ? locale : defaultLocale;
};

setClientInterceptors({ getUserId, getLocale });
