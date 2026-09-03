/* eslint-disable react/jsx-no-literals */
import React, { FC } from "react";
import classNames from "classnames";
import {
  Thumbnail2d,
  ThumbnailTypes,
  ThumbnailAvatarHeadshotSize,
  ThumbnailFormat,
} from "roblox-thumbnails";
import { Button } from "@rbx/core-ui/legacy/react-style-guide";
import { withTranslations, WithTranslationsProps } from "@rbx/core-scripts/react";
import { urlService } from "@rbx/core-scripts/legacy/core-utilities";
import { RobuxGiftErrorType } from "../constants/TypeDefinitions";
import { translationConfig } from "../translation.config";
import { GiftingProductsStep } from "../hooks/useGiftingProducts";
import { translations, URLs } from "../constants/Constants";
import { isEmptyUser } from "../utils/gifting";
import UserSearch from "./UserSearch";

const {
  giftingRobuxTitle: { key: title, default: titleDefault },
  giftingRobuxSubtitle: { key: subtitle, default: subtitleDefault },
  giftNow: { key: giftNow, default: giftNowDefault },
  sendingTo: { key: sendingTo, default: sendingToDefault },
  ensureCorrectness: { key: ensureCorrectness, default: ensureCorrectnessDefault },
  contactSupport: { key: contactSupport, default: contactSupportDefault },
  recipientIneligibleErrorTitle: {
    key: recipientIneligibleErrorTitle,
    default: recipientIneligibleErrorTitleDefault,
  },
  recipientIneligibleErrorSubtitle: {
    key: recipientIneligibleErrorSubtitle,
    default: recipientIneligibleErrorSubtitleDefault,
  },
} = translations;

type GiftingProductsTitleProps = {} & WithTranslationsProps;

const GiftingProductsTitleContainer: FC<GiftingProductsTitleProps> = ({ translate }) => {
  return (
    <div className="gifting-products-title-container">
      <h1>{translate(title) || titleDefault}</h1>
      <p>{translate(subtitle) || subtitleDefault}</p>
    </div>
  );
};
const GiftingProductsTitle = withTranslations(GiftingProductsTitleContainer, translationConfig);

type ContactSupportContainerProps = {
  className?: string;
} & WithTranslationsProps;

const ContactSupportContainer: FC<ContactSupportContainerProps> = ({ className, translate }) => {
  return (
    <div className={classNames("contact-support-container", className)}>
      <p>{translate(ensureCorrectness) || ensureCorrectnessDefault}</p>
      <p
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html:
            translate(contactSupport, {
              contactSupportStart: `<a href="${urlService.getAbsoluteUrl(
                URLs.supportUrl,
              )}" class="text-link">`,
              contactSupportEnd: "</a>",
            }) || contactSupportDefault,
        }}
      />
    </div>
  );
};
const ContactSupport = withTranslations(ContactSupportContainer, translationConfig);

type GiftingProductsErrorProps = {
  hidden: boolean;
} & WithTranslationsProps;

const GiftingProductsErrorContainer: FC<GiftingProductsErrorProps> = ({ translate, hidden }) => {
  if (hidden) {
    return null;
  }

  return (
    <div className="gifting-products-error-container">
      <div className="icon-gifting-error" />
      <div className="error-info-container">
        <div className="title">
          {translate(recipientIneligibleErrorTitle) || recipientIneligibleErrorTitleDefault}
        </div>
        <div className="subtitle">
          {translate(recipientIneligibleErrorSubtitle) || recipientIneligibleErrorSubtitleDefault}
        </div>
      </div>
    </div>
  );
};
const GiftingProductsError = withTranslations(GiftingProductsErrorContainer, translationConfig);

type GiftingProductsUserProps = {
  step: GiftingProductsStep;
  errorType: RobuxGiftErrorType | null;
  isSearchOpened: boolean;
  isUserEligible: boolean;
  isUserLoading: boolean;
  userId: number | null;
  userName: string;
  displayName: string;
  showSearchButton: boolean;
  onReport: () => void;
  onOpenSearch: () => void;
  onNextStep: () => void;
  onSelectUser: (id: number) => void;
} & WithTranslationsProps;

const GiftingProductsUserContainer: FC<GiftingProductsUserProps> = ({
  translate,
  errorType,
  step,
  isSearchOpened,
  isUserEligible,
  isUserLoading,
  userId,
  userName,
  displayName,
  showSearchButton,
  onNextStep,
  onOpenSearch,
  onSelectUser,
}) => {
  if (isSearchOpened && userId === null) {
    return step === GiftingProductsStep.INTRO ? <UserSearch onSelectUser={onSelectUser} /> : null;
  }

  const content =
    Boolean(userName) || isUserLoading ? (
      <React.Fragment>
        <GiftingProductsError
          hidden={errorType === null || isEmptyUser(userId) || (!isUserLoading && !userName)}
        />
        <div className="gifting-products-user-container">
          <div className="left-container">
            <div className="user-thumbnail-wrapper">
              <Thumbnail2d
                targetId={userId ?? ""}
                type={ThumbnailTypes.avatarHeadshot}
                size={ThumbnailAvatarHeadshotSize.size150}
                format={ThumbnailFormat.png}
              />
            </div>
          </div>
          <div className="right-container">
            <div className="sending-to">{translate(sendingTo) || sendingToDefault}</div>
            <div className="user-info">
              <div className="user-names">
                {isUserLoading ? (
                  <div
                    role="progressbar"
                    aria-label="Loading content"
                    className="spinner spinner-default user-info-spinner"
                  />
                ) : (
                  <React.Fragment>
                    {displayName && <div className="display-name">{displayName}</div>}
                    {userName && <div className="name">{`@${userName}`}</div>}
                  </React.Fragment>
                )}
              </div>
            </div>
            {step === GiftingProductsStep.INTRO && (
              <div className="get-started-container">
                <Button
                  isDisabled={!isUserEligible}
                  className="get-started-button"
                  size={Button.sizes.large}
                  variant={!isUserEligible ? Button.variants.control : Button.variants.growth}
                  onClick={onNextStep}
                >
                  {translate(giftNow) || giftNowDefault}
                </Button>
                {showSearchButton && (
                  <Button
                    className="open-search-button"
                    size={Button.sizes.large}
                    variant={Button.variants.control}
                    onClick={onOpenSearch}
                  >
                    <span className="icon-common-search-sm" />
                  </Button>
                )}
              </div>
            )}
            {step !== GiftingProductsStep.INTRO && <ContactSupport />}
          </div>
          {step === GiftingProductsStep.INTRO && (
            <ContactSupport className="contact-support-full-row-container" />
          )}
        </div>
      </React.Fragment>
    ) : (
      <React.Fragment>
        {step === GiftingProductsStep.INTRO && <UserSearch onSelectUser={onSelectUser} />}
        <div className="gifting-products-user-not-found">
          <div className="icon-oof" />
          <p>{translate("Message.Gifting.UserNotFound")}</p>
        </div>
      </React.Fragment>
    );

  return content;
};
const GiftingProductsUser = withTranslations(GiftingProductsUserContainer, translationConfig);

type GiftingProductsHeaderProps = {
  step: GiftingProductsStep;
  errorType: RobuxGiftErrorType | null;
  isUserEligible: boolean;
  isUserLoading: boolean;
  userId: number | null;
  userName: string;
  displayName: string;
  isSearchOpened: boolean;
  showSearchButton: boolean;
  onReport: () => void;
  onNextStep: () => void;
  onOpenSearch: () => void;
  onChangeUserId: (id: number) => void;
} & WithTranslationsProps;

const GiftingProductsHeader: FC<GiftingProductsHeaderProps> = ({
  step,
  isUserEligible,
  isUserLoading,
  errorType,
  userId,
  userName,
  displayName,
  isSearchOpened,
  showSearchButton,
  onReport,
  onNextStep,
  onOpenSearch,
  onChangeUserId,
}) => {
  return (
    <div className="gifting-products-header-container">
      <GiftingProductsTitle />
      <GiftingProductsUser
        step={step}
        errorType={errorType}
        isSearchOpened={isSearchOpened}
        isUserEligible={isUserEligible}
        isUserLoading={isUserLoading}
        userId={userId}
        userName={userName}
        displayName={displayName}
        showSearchButton={showSearchButton}
        onReport={onReport}
        onNextStep={onNextStep}
        onOpenSearch={onOpenSearch}
        onSelectUser={onChangeUserId}
      />
    </div>
  );
};

export default withTranslations(GiftingProductsHeader, translationConfig);
