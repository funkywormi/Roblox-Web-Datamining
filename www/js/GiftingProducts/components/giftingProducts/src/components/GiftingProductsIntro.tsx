import { FC } from "react";
import { withTranslations, WithTranslationsProps } from "@rbx/core-scripts/react";
import { urlService } from "@rbx/core-scripts/legacy/core-utilities";
import { translations, URLs } from "../constants/Constants";
import { translationConfig } from "../translation.config";

const {
  giftingRobuxSectionTitle: {
    key: giftingRobuxSectionTitle,
    default: giftingRobuxSectionTitleDefault,
  },
  giftingRobuxSectionSubtitle: {
    key: giftingRobuxSectionSubtitle,
    default: giftingRobuxSectionSubtitleDefault,
  },
  robloxSectionTitle: { key: robloxSectionTitle, default: robloxSectionTitleDefault },
  robloxSectionSubtitle: { key: robloxSectionSubtitle, default: robloxSectionSubtitleDefault },
  reportUserSectionTitle: { key: reportUserSectionTitle, default: reportUserSectionTitleDefault },
  reportUserSectionSubtitle: {
    key: reportUserSectionSubtitle,
    default: reportUserSectionSubtitleDefault,
  },
} = translations;

type GiftingProductsIntroProps = {} & WithTranslationsProps;

const GiftingProductsIntro: FC<GiftingProductsIntroProps> = ({ translate }) => {
  return (
    <div className="gifting-products-intro-container">
      <section>
        <h2>{translate(robloxSectionTitle) || robloxSectionTitleDefault}</h2>
        <p>{translate(robloxSectionSubtitle) || robloxSectionSubtitleDefault}</p>
      </section>
      <section>
        <h2>{translate(giftingRobuxSectionTitle) || giftingRobuxSectionTitleDefault}</h2>
        <p>{translate(giftingRobuxSectionSubtitle) || giftingRobuxSectionSubtitleDefault}</p>
      </section>
      <section>
        <h2>{translate(reportUserSectionTitle) || reportUserSectionTitleDefault}</h2>
        <p
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html:
              translate(reportUserSectionSubtitle, {
                robloxSupportStart: `<a href="${urlService.getAbsoluteUrl(
                  URLs.supportUrl,
                )}" class="text-link">`,
                robloxSupportEnd: "</a>",
              }) || reportUserSectionSubtitleDefault,
          }}
        />
      </section>
      <div className="robux-about-preview" />
    </div>
  );
};

export default withTranslations(GiftingProductsIntro, translationConfig);
