import React, { useEffect, useState } from "react";
import { withTranslations, WithTranslationsProps } from "@rbx/core-scripts/react";
import { get } from "@rbx/core-lib/cookie";
import { translation } from "../../component.json";
import cookieBannerServices from "../services/cookieBannerServices";
import cookieConstants from "../constants/cookieConstants";
import bannerConstants from "../constants/bannerConstants";
import consentCookieHandler from "../utils/consentCookieHandler";
import { TCookiePolicy, TEssentialCookie } from "../types/cookiePolicyTypes";
import Banner from "./Banner";
import ConsentTool from "./ConsentTool";

const CookieBannerV3Base = ({ translate }: WithTranslationsProps): React.JSX.Element => {
  const [nonEssentialCookieList, updateNonEssentialCookieList] = useState<string[]>([]);
  const [essentialCookieList, updateEssentialCookieList] = useState<TEssentialCookie[]>([]);
  const [shouldDisplayBannerOrConsentTool, updateBannerVisibility] = useState<string | null>(null);

  const { cookieModule } = bannerConstants;
  useEffect(() => {
    const updateCookiePolicy = async () => {
      const cookiePolicy: TCookiePolicy = await cookieBannerServices.getCookiePolicy();
      if (cookiePolicy.ShouldDisplayCookieBannerV3 && cookiePolicy.EssentialCookieList) {
        updateNonEssentialCookieList(cookiePolicy.NonEssentialCookieList);
        updateEssentialCookieList(cookiePolicy.EssentialCookieList);
        updateBannerVisibility(cookieModule.banner);
      } else {
        // User outside of EEA,
        // default to accept all cookies
        consentCookieHandler.setUserConsent(
          cookiePolicy.NonEssentialCookieList,
          cookiePolicy.NonEssentialCookieList,
        );
      }
    };
    const consentCookie = get(cookieConstants.consentCookieName);
    if (consentCookie == null || consentCookie.value === "") {
      // eslint-disable-next-line no-void
      void updateCookiePolicy();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  switch (shouldDisplayBannerOrConsentTool) {
    case cookieModule.banner:
      return (
        <Banner
          translate={translate}
          nonEssentialCookieList={nonEssentialCookieList}
          closeBanner={() => {
            updateBannerVisibility(null);
          }}
          showConsentTool={() => {
            updateBannerVisibility(cookieModule.consentTool);
          }}
        />
      );
    case cookieModule.consentTool:
      return (
        <ConsentTool
          translate={translate}
          essentialCookieList={essentialCookieList}
          nonEssentialCookieList={nonEssentialCookieList}
          closeConsentTool={updateBannerVisibility}
        />
      );
    case null:
    default:
      return <div />;
  }
};

export default withTranslations(CookieBannerV3Base, translation);
