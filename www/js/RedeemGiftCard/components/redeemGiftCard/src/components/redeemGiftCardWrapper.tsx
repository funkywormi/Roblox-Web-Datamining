/* eslint-disable no-void */
import React, { useEffect, useState } from "react";
import { TranslateFunction } from "react-utilities";
import { urlService } from "core-utilities";
import { getRedeemMetadata, getTwentyPercentMoreRobuxStatus } from "@rbx/payments/creditCheckout";
import RedeemGiftCard from "./redeemGiftCard";
import { redeemCodeQueryParamKey } from "../constants/redeemGiftCardConstants";

type Props = {
  translate: TranslateFunction;
  intl: { getRobloxLocale: () => string };
};

function RedeemGiftCardWrapper({ translate, intl }: Props) {
  const [pinPlaceholder, setPinPlaceholder] = useState("");
  const [showTwentyPercentMoreRobux, setShowTwentyPercentMoreRobux] = useState(false);

  useEffect(() => {
    async function getPinPlaceholder() {
      const placeholder = urlService.getQueryParam(redeemCodeQueryParamKey);
      if (typeof placeholder === "string") {
        setPinPlaceholder(placeholder);
        return;
      }

      const { data } = (await getRedeemMetadata()) as { data: { pinPlaceholder: string } };
      setPinPlaceholder(data.pinPlaceholder);
    }

    void getPinPlaceholder();
    getTwentyPercentMoreRobuxStatus().then(response => {
      setShowTwentyPercentMoreRobux(response);
    });
  }, []);

  return (
    <div id="redeem-gift-card-container">
      <RedeemGiftCard
        translate={translate}
        intl={intl}
        pinPlaceholder={pinPlaceholder}
        showTwentyPercentMoreRobux={showTwentyPercentMoreRobux}
      />
    </div>
  );
}

export default RedeemGiftCardWrapper;
