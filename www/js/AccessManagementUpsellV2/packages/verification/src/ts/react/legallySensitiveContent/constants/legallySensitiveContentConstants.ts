import ConsentName from '../enums/ConsentName';

/** Shared copy for VPC “enter parent email” flows; descriptions differ by consent name. */
const vpcRequestLinkBase = {
  titleTranslationKey: 'Title.EnterParentEmailV2',
  titleSourceContentId: '1400648',
  parentEmailLabelTranslationKey: 'Label.ParentEmail',
  parentEmailLabelSourceContentId: '2575432',
  parentEmailPlaceholderTranslationKey: 'Label.EmailCapitalized',
  parentEmailPlaceholderSourceContentId: '1399624',
  parentEmailFooterTranslationKey: 'Description.ParentalEmailFooter',
  parentEmailFooterSourceContentId: '332360',
  linkStart:
    '<a class="text-link" rel="noreferrer" target="_blank" href="https://en.help.roblox.com/hc/articles/115004630823">',
  linkEnd: '</a>',
  linkStartParam: '{linkStart}',
  linkEndParam: '{linkEnd}',
  buttonTranslationKey: 'Action.SendEmail',
  buttonSourceContentId: '1398857',
  lineBreak: '<br /><br />',
  lineBreakParam: '{lineBreak}'
};

// source content ids are generated from translations hub
const legallySensitiveContentConstants = {
  [ConsentName.phoneNumberDiscoverabilitySetting]: {
    titleTranslationKey: 'Heading.FriendDiscovery',
    titleSourceContentId: '4063304',
    consentTranslationKey: 'Description.PhoneNumberDiscoverabilityConsent.FriendsRename',
    consentSourceContentId: '7216456'
  },
  [ConsentName.phoneNumberDiscoverabilitySettingParentSide]: {
    titleTranslationKey: 'Heading.FriendDiscovery',
    titleSourceContentId: '4063304',
    consentTranslationKey: 'Description.ParentSide.PhoneNumberDiscoverabilityConsent.TFR',
    consentSourceContentId: '7237448'
  },
  [ConsentName.phoneNumberDiscoverabilityUpsell]: {
    titleTranslationKey: 'Heading.TurnOnFriendDiscovery',
    titleSourceContentId: '4123720',
    consentTranslationKey: 'Description.PhoneNumberDiscoverabilityUpsellConsent.FRnm',
    consentSourceContentId: '7235400',
    actionButtonTextTranslationKey: 'Action.FriendDiscovery.TurnOn',
    actionButtonTextSourceContentId: '4123208',
    neutralButtonTextTranslationKey: 'Action.FriendDiscovery.NotNow',
    neutralButtonTextSourceContentId: '4122952'
  },
  [ConsentName.personalizedAdsSetting]: {
    titleTranslationKey: 'Heading.PersonalizeYourAds',
    titleSourceContentId: '4190024',
    consentTranslationKey: 'Description.PersonalizeAds',
    consentSourceContentId: '4190536',
    linkStart: '<a href="https://en.help.roblox.com/hc/articles/28943243301780" class="text-link">',
    linkEnd: '</a>',
    linkStartParam: '{linkStart}',
    linkEndParam: '{linkEnd}'
  },
  [ConsentName.sellShareDataSetting]: {
    titleTranslationKey: 'Heading.DataSellingAndSharing',
    titleSourceContentId: '4190280',
    consentTranslationKey: 'Description.DataSellingAndSharing',
    consentSourceContentId: '4190792',
    linkStart: '<a href="https://en.help.roblox.com/hc/articles/28943243301780" class="text-link">',
    linkEnd: '</a>',
    linkStartParam: '{linkStart}',
    linkEndParam: '{linkEnd}'
  },
  [ConsentName.allowMarketingEmailCheckboxEmailVerification]: {
    consentTranslationKey: 'Description.EmailNotificationsOptIn',
    consentSourceContentId: '4557640'
  },
  [ConsentName.allowMarketingEmailNotifications]: {
    pageHeadingTranslationKey: 'Label.LSC.NewsAndAnnouncements',
    pageHeadingSourceContentId: '8125000',
    pageDescriptionTranslationKey: 'Description.LSC.ChooseNotificationTypes',
    pageDescriptionSourceContentId: '8125256',
    labelTranslationKey: 'Label.LSC.EmailChannelLabel',
    labelSourceContentId: '8125512',
    labelDescriptionTranslationKey: 'Description.LSC.TurnOnEmail',
    labelDescriptionSourceContentId: '8125768'
  },
  [ConsentName.voiceDataConsentSetting]: {
    titleTranslationKey: 'Heading.VoiceDataConsent',
    titleSourceContentId: '4565320',
    consentTranslationKey: 'Description.VoiceDataConsent',
    consentSourceContentId: '4565576',
    linkStart: '<a href="https://en.help.roblox.com/hc/articles/5704050147604" class="text-link">',
    linkEnd: '</a>',
    linkStartParam: '{linkStart}',
    linkEndParam: '{linkEnd}'
  },
  [ConsentName.voiceDataConsentSettingParentSide]: {
    titleTranslationKey: 'Heading.VoiceDataConsent',
    titleSourceContentId: '4565320',
    consentTranslationKey: 'Description.ParentSide.VoiceDataConsent',
    consentSourceContentId: '4565832',
    linkStart: '<a href="https://en.help.roblox.com/hc/articles/5704050147604" class="text-link">',
    linkEnd: '</a>',
    linkStartParam: '{linkStart}',
    linkEndParam: '{linkEnd}'
  },
  [ConsentName.whoCanPartyWithMe]: {
    pageTitleTranslationKey: 'Heading.PartyAndPartyChat',
    pageTitleSourceContentId: '7180360',
    pageDescriptionTranslationKey: 'Description.PartyAndPartyChat',
    pageDescriptionSourceContentId: '7181640',
    titleTranslationKey: 'Label.Party',
    titleSourceContentId: '2137161',
    consentTranslationKey: 'Description.PlayGamesTogetherWithYourFriends',
    consentSourceContentId: '9550152'
  },
  [ConsentName.whoCanPartyWithMeV2]: {
    pageTitleTranslationKey: 'Heading.ChatAndPartyWithFriends',
    pageTitleSourceContentId: '9225544',
    pageDescriptionTranslationKey: 'Description.ManagePartyAndCommunications',
    pageDescriptionSourceContentId: '9225800',
    titleTranslationKey: 'Heading.ChatAndPartyWithFriends',
    titleSourceContentId: '9225544',
    consentTranslationKey: 'Description.JoinGamesAndChatWithFriends',
    consentSourceContentId: '9447241'
  },
  [ConsentName.whoCanPartyWithMeParentSide]: {
    pageTitleTranslationKey: 'Heading.PartyAndPartyChat',
    pageTitleSourceContentId: '7180360',
    pageDescriptionTranslationKey: 'Description.PartyAndPartyChatParentSide',
    pageDescriptionSourceContentId: '7261256',
    titleTranslationKey: 'Label.Party',
    titleSourceContentId: '2137161',
    consentTranslationKey: 'Description.ParentSide.AllowYourChildToJoinGameWithFriends',
    consentSourceContentId: '9535560'
  },
  [ConsentName.whoCanPartyWithMeParentSideV2]: {
    pageTitleTranslationKey: 'Heading.ChatAndPartyWithFriends',
    pageTitleSourceContentId: '9225544',
    pageDescriptionTranslationKey: 'Description.PartyAndPartyChatParentSide',
    pageDescriptionSourceContentId: '7261256',
    titleTranslationKey: 'Heading.ChatAndPartyWithFriends',
    titleSourceContentId: '9225544',
    consentTranslationKey: 'Description.ParentSide.AllowYourChildGamesChatWithFriends',
    consentSourceContentId: '9620552'
  },
  [ConsentName.whoCanUsePartyChatWithMe]: {
    pageTitleTranslationKey: 'Heading.PartyAndPartyChat',
    pageTitleSourceContentId: '7180360',
    pageDescriptionTranslationKey: 'Description.PartyAndPartyChat',
    pageDescriptionSourceContentId: '7181640',
    titleTranslationKey: 'Label.PartyChat',
    titleSourceContentId: '7180616',
    consentTranslationKey: 'Description.PartyChat',
    consentSourceContentId: '7182152'
  },
  [ConsentName.whoCanUsePartyChatWithMeV2]: {
    pageTitleTranslationKey: 'Heading.ChatAndPartyWithFriends',
    pageTitleSourceContentId: '9225544',
    pageDescriptionTranslationKey: 'Description.ManagePartyAndCommunications',
    pageDescriptionSourceContentId: '9225800',
    titleTranslationKey: 'Heading.FriendsChat',
    titleSourceContentId: '9315144',
    consentTranslationKey: 'Description.FriendsChat',
    consentSourceContentId: '9315400'
  },
  [ConsentName.whoCanUsePartyChatWithMeParentSide]: {
    pageTitleTranslationKey: 'Heading.PartyAndPartyChat',
    pageTitleSourceContentId: '7180360',
    pageDescriptionTranslationKey: 'Description.PartyAndPartyChatParentSide',
    pageDescriptionSourceContentId: '7261256',
    titleTranslationKey: 'Label.PartyChat',
    titleSourceContentId: '7180616',
    consentTranslationKey: 'Description.PartyChatConsent',
    consentSourceContentId: '7194184'
  },
  [ConsentName.whoCanUsePartyChatWithMeParentSideV2]: {
    pageTitleTranslationKey: 'Heading.ChatAndPartyWithFriends',
    pageTitleSourceContentId: '9225544',
    pageDescriptionTranslationKey: 'Description.PartyAndPartyChatParentSide',
    pageDescriptionSourceContentId: '7261256',
    titleTranslationKey: 'Heading.FriendsChat',
    titleSourceContentId: '9315144',
    consentTranslationKey: 'Description.ParentSide.FriendsChat',
    consentSourceContentId: '9620808'
  },
  [ConsentName.whoCanUsePartyVoiceWithMe]: {
    pageTitleTranslationKey: 'Heading.PartyAndPartyChat',
    pageTitleSourceContentId: '7180360',
    pageDescriptionTranslationKey: 'Description.PartyAndPartyChat',
    pageDescriptionSourceContentId: '7181640',
    titleTranslationKey: 'Label.PartyVoiceChat',
    titleSourceContentId: '7181384',
    consentTranslationKey: 'Description.PartyVoiceChat',
    consentSourceContentId: '7182408'
  },
  [ConsentName.whoCanUsePartyVoiceWithMeV2]: {
    pageTitleTranslationKey: 'Heading.ChatAndPartyWithFriends',
    pageTitleSourceContentId: '9225544',
    pageDescriptionTranslationKey: 'Description.ManagePartyAndCommunications',
    pageDescriptionSourceContentId: '9225800',
    titleTranslationKey: 'Heading.VoiceChatWithFriends',
    titleSourceContentId: '9315656',
    consentTranslationKey: 'Description.VoiceChatWithFriends',
    consentSourceContentId: '9315912'
  },
  [ConsentName.whoCanUsePartyVoiceWithMeParentSide]: {
    pageTitleTranslationKey: 'Heading.PartyAndPartyChat',
    pageTitleSourceContentId: '7180360',
    pageDescriptionTranslationKey: 'Description.PartyAndPartyChatParentSide',
    pageDescriptionSourceContentId: '7261256',
    titleTranslationKey: 'Label.PartyVoiceChat',
    titleSourceContentId: '7181384',
    consentTranslationKey: 'Description.PartyVoiceChatConsent',
    consentSourceContentId: '7194440'
  },
  [ConsentName.whoCanUsePartyVoiceWithMeParentSideV2]: {
    pageTitleTranslationKey: 'Heading.ChatAndPartyWithFriends',
    pageTitleSourceContentId: '9225544',
    pageDescriptionTranslationKey: 'Description.PartyAndPartyChatParentSide',
    pageDescriptionSourceContentId: '7261256',
    titleTranslationKey: 'Heading.VoiceChatWithFriends',
    titleSourceContentId: '9315656',
    consentTranslationKey: 'Description.PartyVoiceChatConsent',
    consentSourceContentId: '7194440'
  },
  [ConsentName.whoCanPartyWithMeTrustedFriends]: {
    pageTitleTranslationKey: 'Heading.PartyAndPartyChat',
    pageTitleSourceContentId: '7180360',
    pageDescriptionTranslationKey: 'Description.PartySetting.AddToParty',
    pageDescriptionSourceContentId: '8316488',
    titleTranslationKey: 'Label.Party',
    titleSourceContentId: '2137161',
    consentTranslationKey: 'Description.PlayGamesTogetherWithYourFriends',
    consentSourceContentId: '9550152'
  },
  [ConsentName.whoCanPartyWithMeTrustedFriendsV2]: {
    pageTitleTranslationKey: 'Heading.ChatAndPartyWithFriends',
    pageTitleSourceContentId: '9225544',
    pageDescriptionTranslationKey: 'Description.PartySetting.AddToParty',
    pageDescriptionSourceContentId: '8316488',
    titleTranslationKey: 'Heading.ChatAndPartyWithFriends',
    titleSourceContentId: '9225544',
    consentTranslationKey: 'Description.PlayGamesTogetherWithYourFriends',
    consentSourceContentId: '9550152'
  },
  [ConsentName.whoCanPartyWithMeParentSideRemovedComms]: {
    pageTitleTranslationKey: 'Heading.PartyAndPartyChat',
    pageTitleSourceContentId: '7180360',
    pageDescriptionTranslationKey: 'Description.PartySettingConsent.AddToParty',
    pageDescriptionSourceContentId: '8316744',
    titleTranslationKey: 'Label.Party',
    titleSourceContentId: '2137161',
    consentTranslationKey: 'Description.PartySettingConsent.AddToParty',
    consentSourceContentId: '8316744'
  },
  [ConsentName.whoCanPartyWithMeParentSideRemovedCommsV2]: {
    pageTitleTranslationKey: 'Heading.ChatAndPartyWithFriends',
    pageTitleSourceContentId: '9225544',
    pageDescriptionTranslationKey: 'Description.PartySettingConsent.AddToParty',
    pageDescriptionSourceContentId: '8316744',
    titleTranslationKey: 'Heading.ChatAndPartyWithFriends',
    titleSourceContentId: '9225544',
    consentTranslationKey: 'Description.PartySettingConsent.AddToParty',
    consentSourceContentId: '8316744'
  },
  [ConsentName.whoCanUsePartyChatWithMeTrustedFriends]: {
    pageTitleTranslationKey: 'Heading.PartyAndPartyChat',
    pageTitleSourceContentId: '7180360',
    pageDescriptionTranslationKey: 'Description.PartyAndPartyChat',
    pageDescriptionSourceContentId: '7181640',
    titleTranslationKey: 'Label.PartyChat',
    titleSourceContentId: '7180616',
    consentTranslationKey: 'Description.PartyChat.TrustedFriendsOnly',
    consentSourceContentId: '8313416'
  },
  [ConsentName.whoCanUsePartyChatWithMeTrustedFriendsV2]: {
    pageTitleTranslationKey: 'Heading.ChatAndPartyWithFriends',
    pageTitleSourceContentId: '9225544',
    pageDescriptionTranslationKey: 'Description.ManagePartyAndCommunications',
    pageDescriptionSourceContentId: '9225800',
    titleTranslationKey: 'Heading.FriendsChat',
    titleSourceContentId: '9315144',
    consentTranslationKey: 'Description.PartyChat.TrustedFriendsOnly',
    consentSourceContentId: '8313416'
  },
  [ConsentName.whoCanUsePartyChatWithMeParentSideTrustedFriends]: {
    pageTitleTranslationKey: 'Heading.PartyAndPartyChat',
    pageTitleSourceContentId: '7180360',
    pageDescriptionTranslationKey: 'Description.PartyAndPartyChatParentSide',
    pageDescriptionSourceContentId: '7261256',
    titleTranslationKey: 'Label.PartyChat',
    titleSourceContentId: '7180616',
    consentTranslationKey: 'Description.PartyChatConsent.TrustedFriends',
    consentSourceContentId: '8314952'
  },
  [ConsentName.whoCanUsePartyChatWithMeParentSideTrustedFriendsV2]: {
    pageTitleTranslationKey: 'Heading.ChatAndPartyWithFriends',
    pageTitleSourceContentId: '9225544',
    pageDescriptionTranslationKey: 'Description.PartyAndPartyChatParentSide',
    pageDescriptionSourceContentId: '7261256',
    titleTranslationKey: 'Heading.FriendsChat',
    titleSourceContentId: '9315144',
    consentTranslationKey: 'Description.PartyChatConsent.TrustedFriends',
    consentSourceContentId: '8314952'
  },
  [ConsentName.whoCanUsePartyVoiceWithMeTrustedFriends]: {
    pageTitleTranslationKey: 'Heading.PartyAndPartyChat',
    pageTitleSourceContentId: '7180360',
    pageDescriptionTranslationKey: 'Description.PartyAndPartyChat',
    pageDescriptionSourceContentId: '7181640',
    titleTranslationKey: 'Label.PartyVoiceChat',
    titleSourceContentId: '7181384',
    consentTranslationKey: 'Description.PartyVoiceChat.TrustedFriendsOnly',
    consentSourceContentId: '8313672'
  },
  [ConsentName.whoCanUsePartyVoiceWithMeTrustedFriendsV2]: {
    pageTitleTranslationKey: 'Heading.ChatAndPartyWithFriends',
    pageTitleSourceContentId: '9225544',
    pageDescriptionTranslationKey: 'Description.ManagePartyAndCommunications',
    pageDescriptionSourceContentId: '9225800',
    titleTranslationKey: 'Heading.VoiceChatWithFriends',
    titleSourceContentId: '9315656',
    consentTranslationKey: 'Description.PartyVoiceChat.TrustedFriendsOnly',
    consentSourceContentId: '8313672'
  },
  [ConsentName.whoCanUsePartyVoiceWithMeParentSideTrustedFriends]: {
    pageTitleTranslationKey: 'Heading.PartyAndPartyChat',
    pageTitleSourceContentId: '7180360',
    pageDescriptionTranslationKey: 'Description.PartyAndPartyChatParentSide',
    pageDescriptionSourceContentId: '7261256',
    titleTranslationKey: 'Label.PartyVoiceChat',
    titleSourceContentId: '7181384',
    consentTranslationKey: 'Description.PartyVoiceChatConsent',
    consentSourceContentId: '7194440'
  },
  [ConsentName.whoCanUsePartyVoiceWithMeParentSideTrustedFriendsV2]: {
    pageTitleTranslationKey: 'Heading.ChatAndPartyWithFriends',
    pageTitleSourceContentId: '9225544',
    pageDescriptionTranslationKey: 'Description.PartyAndPartyChatParentSide',
    pageDescriptionSourceContentId: '7261256',
    titleTranslationKey: 'Heading.VoiceChatWithFriends',
    titleSourceContentId: '9315656',
    consentTranslationKey: 'Description.PartyVoiceChatConsent',
    consentSourceContentId: '7194440'
  },
  [ConsentName.receiveRobuxTransferConsentCard]: {
    titleTranslationKey: 'Heading.ConversationalRequest.ReceiveTransfer.Robux',
    titleSourceContentId: '7140680',
    descriptionTranslationKey: 'Description.ReceiveRobuxTransfer',
    descriptionSourceContentId: '7154504',
    usernameParam: '{username}',
    amountParam: '{amount}',
    robuxAmountParam: '{robuxAmount}'
  },
  [ConsentName.sendRobuxTransferConsentCard]: {
    titleTranslationKey: 'Heading.ConversationalRequest.SendTransfer.Robux',
    titleSourceContentId: '7140424',
    descriptionTranslationKey: 'Description.SendRobuxTransfer',
    descriptionSourceContentId: '7154760',
    usernameParam: '{username}',
    amountParam: '{amount}',
    robuxAmountParam: '{robuxAmount}'
  },
  [ConsentName.vpcRequestLinkSubjectToPC]: {
    ...vpcRequestLinkBase,
    descriptionTranslationKey: 'Description.EnterParentEmailV5',
    descriptionSourceContentId: '3710792'
  },
  [ConsentName.vpcRequestLinkNotSubjectToPC]: {
    ...vpcRequestLinkBase,
    descriptionTranslationKey: 'Description.EnterParentEmailWithoutParentalControlV2',
    descriptionSourceContentId: '3618888'
  },
  [ConsentName.vpcRequestLinkDefault]: {
    ...vpcRequestLinkBase,
    descriptionTranslationKey: 'Description.EnterParentEmailWithoutParentalControl',
    descriptionSourceContentId: '2540872'
  },
  [ConsentName.consentCenterAllowAction]: {
    textTranslationKey: 'Description.AllowYourChild',
    textSourceContentId: '1844552',
    actionNameParam: '{actionName}'
  },
  [ConsentName.consentCenterUpdateSettingNoValue]: {
    textTranslationKey: 'Description.UpdateChildSetting',
    textSourceContentId: '1566280',
    settingNameParam: '{settingName}'
  },
  [ConsentName.consentCenterUpdateSettingWithValue]: {
    textTranslationKey: 'Description.UpdateChildSettingFromTo',
    textSourceContentId: '1566536',
    settingNameParam: '{settingName}',
    currentValueParam: '{currentValue}',
    proposedValueParam: '{proposedValue}'
  }
};

export default legallySensitiveContentConstants;
