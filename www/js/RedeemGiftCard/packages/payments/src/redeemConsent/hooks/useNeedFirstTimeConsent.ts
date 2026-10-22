/* eslint no-void: ["error", { "allowAsStatement": true }] */
import { useState, useEffect } from "react";
import { getCurrentUser } from "@rbx/www-common/user";
import { getLocalCreditRedemptionConsent } from "../services/api";

export default function useNeedFirstTimeConsent(): [boolean, (val: boolean) => void] {
  const [needFirstTimeConsent, setNeedFirstTimeConsent] = useState(false);

  const requestLocalCreditRedemptionConsent = async () => {
    if (!getCurrentUser()) {
      return;
    }

    const result = await getLocalCreditRedemptionConsent();
    if (result.status !== 200) {
      setNeedFirstTimeConsent(false);
      return;
    }

    setNeedFirstTimeConsent(result.data.needConsent);
  };

  useEffect(() => {
    void requestLocalCreditRedemptionConsent();
  }, [needFirstTimeConsent]);

  const setState = (val: boolean): void => {
    setNeedFirstTimeConsent(val);
  };

  return [needFirstTimeConsent, setState];
}
