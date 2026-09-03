import { UpsellCardType, UpsellCardComponentType } from "../constants/upsellCardConstants";

const getCardComponentType = upsellCardType => {
  const {
    ContactMethodEmail,
    ContactMethodPhoneNumber,
    FacebookSunset,
    ContactMethodPhoneNumberEmailHorizontalLayout,
    ContactMethodPhoneNumberEmailHorizontalLayoutAltContent1,
    ContactMethodPhoneNumberEmailVerticalLayout,
    ContactMethodPhoneNumberVoiceOptIn,
  } = UpsellCardType;

  if (upsellCardType === UpsellCardType.AgeVerificationModal) {
    return UpsellCardComponentType.UpsellBanner;
  }
  if (
    [
      ContactMethodEmail,
      ContactMethodPhoneNumber,
      ContactMethodPhoneNumberEmailHorizontalLayout,
      ContactMethodPhoneNumberEmailHorizontalLayoutAltContent1,
      ContactMethodPhoneNumberEmailVerticalLayout,
      ContactMethodPhoneNumberVoiceOptIn,
      FacebookSunset,
    ].includes(upsellCardType)
  ) {
    return UpsellCardComponentType.HomePageUpsellCard;
  }
  return null;
};

export default getCardComponentType;
