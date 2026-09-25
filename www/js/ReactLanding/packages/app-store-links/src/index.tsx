/* eslint-disable camelcase */
import { JSX } from "react";
import { Intl } from "@rbx/core-scripts/legacy/Roblox";
import { WithTranslationsProps } from "@rbx/core-scripts/react";
import "@rbx/core-types";
import "./index.css";
import amazon_en_us from "./images/amazon-badge-en_us.png";
import amazon_ja_jp from "./images/amazon-badge-ja_jp.png";
import apple_en_us from "./images/apple-badge-en_us.svg";
import apple_ja_jp from "./images/apple-badge-ja_jp.svg";
import google_en_us from "./images/google-badge-en_us.svg";
import google_ja_jp from "./images/google-badge-ja_jp.svg";
import meta from "./images/meta-quest-badge-en_us.svg";
import microsoft_en_us from "./images/microsoft-badge-en_us.svg";
import microsoft_ja_jp from "./images/microsoft-badge-ja_jp.svg";
import playstation from "./images/playstation-badge-en_us.svg";
import xbox from "./images/xbox-badge-en_us.svg";
import galaxy_en_us from "./images/galaxy-badge-en_us.webp";
import galaxy_ja_jp from "./images/galaxy-badge-ja_jp.webp";

const appStoreLinkConstants = [
  {
    name: "apple",
    title: "Label.RobloxAppStore",
    href: "Link.AppleAppStoreRobloxApp",
    image: {
      en_us: apple_en_us,
      ja_jp: apple_ja_jp,
    },
  },
  {
    name: "google",
    title: "Label.GetOnGooglePlay",
    href: "Link.GooglePlayStoreRobloxApp",
    image: {
      en_us: google_en_us,
      ja_jp: google_ja_jp,
    },
  },
  {
    name: "playstation",
    title: "Label.PlayStationStoreRobloxApp",
    href: "Link.PlayStationStoreRobloxAppV2",
    image: {
      en_us: playstation,
      ja_jp: playstation,
    },
  },
  {
    name: "xbox",
    title: "Label.RobloxOnXbox",
    href: "Link.XboxStoreRobloxApp",
    image: {
      en_us: xbox,
      ja_jp: xbox,
    },
  },
  {
    name: "meta-quest",
    title: "Label.MetaQuestStoreRobloxApp",
    href: "Link.MetaQuestStoreRobloxApp",
    image: {
      en_us: meta,
      ja_jp: meta,
    },
  },
  {
    name: "microsoft",
    title: "Label.RobloxMicrosoftStore",
    href: "Link.MicrosoftStoreRobloxApp",
    image: {
      en_us: microsoft_en_us,
      ja_jp: microsoft_ja_jp,
    },
  },
  {
    name: "amazon",
    title: "Label.RobloxAmazonStore",
    href: "Link.AmazonStoreRobloxApp",
    image: {
      en_us: amazon_en_us,
      ja_jp: amazon_ja_jp,
    },
  },
  {
    name: "galaxy",
    title: "Label.GalaxyStoreRobloxApp",
    href: "Link.GalaxyStoreRobloxApp",
    image: {
      en_us: galaxy_en_us,
      ja_jp: galaxy_ja_jp,
    },
  },
];

export type AppStoreContainerProps = {
  locale?: "en_us" | "ja_jp";
  onAppClick?: (appName: string) => void;
  translate: WithTranslationsProps["translate"];
  isAccountExperienceRevampEnabled?: boolean;
};

const currentLocale = () => {
  const locale = new Intl().getRobloxLocale();
  return locale === "ja_jp" ? locale : "en_us";
};

export const AppStoreContainer = ({
  locale = currentLocale(),
  onAppClick,
  translate,
  isAccountExperienceRevampEnabled = false,
}: AppStoreContainerProps): JSX.Element => (
  <section className="items-center gap-xxlarge flex flex-col">
    <h3
      className={`content-emphasis text-heading-small padding-none${isAccountExperienceRevampEnabled ? " font-builder-extended" : ""}`}
    >
      {translate("Heading.RobloxOnDevice")}
    </h3>
    <ul className="justify-center gap-xlarge flex wrap">
      {appStoreLinkConstants.map(({ name, title, href, image }) => (
        <li key={name}>
          <a
            href={translate(href)}
            target="_blank"
            rel="noreferrer"
            onClick={
              onAppClick
                ? () => {
                    onAppClick(name);
                  }
                : undefined
            }
          >
            <img src={image[locale]} alt={translate(title)} className="height-1200" />
          </a>
        </li>
      ))}
    </ul>
  </section>
);
