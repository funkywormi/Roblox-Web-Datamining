import { useEffect, useState } from "react";
import { ValueOf } from "@rbx/core-lib";
import { useTranslations } from "@rbx/www-common/i18n";
import { getCurrentUser, userIdToNumber } from "@rbx/www-common/user";
import layoutConstants from "../constants/layoutConstants";
import RobuxBadgeType from "../constants/robuxBadgeConstants";
import { getNavCapability } from "../util/navCapabilities";
import { shouldShowRobuxUpdateBadge } from "../util/robuxBadgeUtil";

const isForbidden = (error: unknown) => {
  if (error == null || typeof error !== "object") {
    return false;
  }
  const { status, response } = error as { status?: unknown; response?: { status?: unknown } };
  return status === 403 || response?.status === 403;
};

export default function useRobuxBalance() {
  const tMessages = useTranslations("CommonUI.Messages");
  const user = getCurrentUser();
  const userId = user == null ? undefined : userIdToNumber(user.id);
  const [isGetCurrencyCallDone, setGetCurrencyCallDone] = useState(false);
  const [robuxAmount, setRobuxAmount] = useState(0);
  const [robuxBadgeType, setRobuxBadgeType] = useState<ValueOf<typeof RobuxBadgeType> | null>(null);
  const [robuxError, setRobuxError] = useState("");
  const [creditDisplayConfig, setCreditDisplayConfig] = useState<
    ValueOf<typeof layoutConstants.creditDisplayConfigVariants>
  >(layoutConstants.creditDisplayConfigVariants.control);
  const [creditAmount, setCreditAmount] = useState(0);
  const [currencyCode, setCurrencyCode] = useState("USD");
  const [creditError, setCreditError] = useState("");
  // wait for experiment to load before loading Robux wallet icons
  const [isExperimentCallDone, setIsExperimentCallDone] = useState(false);

  const getUserCurrencyLocal = () => {
    const getUserCurrency = getNavCapability("getUserCurrency");
    if (userId != null && getUserCurrency != null) {
      setGetCurrencyCallDone(false);
      getUserCurrency(userId)
        .then(
          usercurrencyData => {
            setRobuxError("");
            setRobuxAmount(usercurrencyData.robux);
          },
          () => {
            const untranslatedMessage = layoutConstants.economySystemOutageMessage;
            setRobuxError(
              tMessages.has(untranslatedMessage)
                ? tMessages(untranslatedMessage)
                : untranslatedMessage,
            );
          },
        )
        .finally(() => {
          setGetCurrencyCallDone(true);
        });
    }
  };

  const getRobuxBadgeLocal = () => {
    const getRobuxBadge = getNavCapability("getRobuxBadge");
    if (user != null && getRobuxBadge != null && shouldShowRobuxUpdateBadge() != null) {
      getRobuxBadge()
        .then(robuxBadgeData => {
          const robuxUpdateBadge = shouldShowRobuxUpdateBadge();

          // interpret is_virtual_item_available as indicating we should
          // show the 'New Update' badge, overriding the virtual item badge in all cases.
          if (robuxBadgeData.is_virtual_item_available && robuxUpdateBadge) {
            setRobuxBadgeType(robuxUpdateBadge);
          }
        })
        .catch((error: unknown) => {
          if (isForbidden(error)) {
            setRobuxBadgeType(null);
          }
        });
    }
  };

  const getCreditBalanceLocal = () => {
    const getCreditBalanceForNavigation = getNavCapability("getCreditBalanceForNavigation");
    if (user != null && getCreditBalanceForNavigation != null) {
      getCreditBalanceForNavigation()
        .then(
          creditData => {
            setCreditError("");
            if (
              creditData.creditDisplayConfig === null ||
              creditData.creditBalance === null ||
              creditData.creditBalance === 0 ||
              creditData.currencyCode === null
            ) {
              // if user isn't enrolled in experiment, show control
              // if creditBalance and currencyCode null (for new users), or creditBalance is 0, don't show credit anywhere
              setCreditDisplayConfig(layoutConstants.creditDisplayConfigVariants.control);
            } else {
              setCreditDisplayConfig(creditData.creditDisplayConfig);
            }
            setCreditAmount(creditData.creditBalance ?? 0);
            setCurrencyCode(creditData.currencyCode ?? "USD");
          },
          () => {
            setCreditError(tMessages(layoutConstants.economySystemOutageMessage));
          },
        )
        .finally(() => {
          setIsExperimentCallDone(true);
        });
    }
  };

  useEffect(() => {
    const handleCurrencyUpdate = () => {
      getUserCurrencyLocal();
      getCreditBalanceLocal();
    };
    window.addEventListener("navigation-update-user-currency", handleCurrencyUpdate);
    return () => {
      window.removeEventListener("navigation-update-user-currency", handleCurrencyUpdate);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (user != null) {
      getUserCurrencyLocal();
      getRobuxBadgeLocal();
      getCreditBalanceLocal();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return {
    robuxAmount,
    robuxError,
    robuxBadgeType: robuxBadgeType ?? undefined,
    creditAmount,
    currencyCode,
    creditError,
    creditDisplayConfig,
    isExperimentCallDone,
    isGetCurrencyCallDone,
  };
}
