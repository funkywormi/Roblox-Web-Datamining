import { Linkify } from 'Roblox';
import angular from 'angular';
import chatModule from '../chatModule';

function chatUtility(
  $filter,
  $window,
  dialogAttributes,
  notificationsName,
  channelsNotificationType,
  notificationType,
  presenceLayout,
  httpResponse,
  performanceMarkLabels,
  resources,
  libraryInitialization,
  apiParamsInitialization,
  messageHelper,
  $log
) {
  'ngInject';

  function getDialogInputMaxHeight(inputHeight, dialogLayout) {
    return dialogLayout.maxHeightOfTextInput < inputHeight
      ? dialogLayout.maxHeightOfInput
      : inputHeight;
  }

  function htmlEntities(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function invalidateLinkCardInPieceOfMessage(placeId, messageDictByPlaceIds) {
    const { linkCardMessages } = messageDictByPlaceIds[placeId];
    linkCardMessages.forEach(function (pieceOfMessage) {
      if (placeId === pieceOfMessage.id) {
        pieceOfMessage.isCard = false;
      }
    });
  }

  function getAssetDetails(value) {
    const privateServer = value.match(messageHelper.gameCardRegexs.privateServerLinkCode);
    if (privateServer && privateServer.length == 2) {
      return { privateServerLinkCode: privateServer[1] };
    }
  }

  function emojiPiece(content, isEmoji) {
    return {
      content,
      isEmoji
    };
  }

  return {
    linksLibrary: angular.copy(libraryInitialization.linksLibrary),

    chatLayout: angular.copy(libraryInitialization.chatLayout),

    chatApiParams: angular.copy(apiParamsInitialization.chatApiParams),

    dialogParams: angular.copy(apiParamsInitialization.dialogParams),

    dialogLayoutResetConstant: angular.copy(dialogAttributes.dialogLayoutResetConstant),

    dialogLayout: angular.copy(dialogAttributes.dialogLayout),

    dialogBannerTypes: angular.copy(dialogAttributes.dialogBannerTypes),

    userPresenceTypes: angular.copy(presenceLayout.userPresenceTypes),

    dialogType: angular.copy(dialogAttributes.dialogTypes),

    newGroup: angular.copy(dialogAttributes.newGroup),

    scrollBarType: angular.copy(dialogAttributes.scrollBarTypes),

    errorMessages: angular.copy(libraryInitialization.errors),

    pendingStatus: angular.copy(dialogAttributes.pendingStatus),

    moderationType: angular.copy(dialogAttributes.moderationType),

    osaAcknowledgementStatus: angular.copy(dialogAttributes.osaAcknowledgementStatus),

    userChatMessageOptInStatus: angular.copy(dialogAttributes.userChatMessageOptInStatus),

    dialogInitValue: angular.copy(dialogAttributes.dialogInitValue),

    dialogStatus: angular.copy(dialogAttributes.dialogStatus),

    conversationInitStatus: angular.copy(dialogAttributes.conversationInitStatus),

    conversationType: angular.copy(dialogAttributes.conversationType),

    conversationSource: angular.copy(dialogAttributes.conversationSource),

    messageSenderType: angular.copy(dialogAttributes.messageSenderType),

    modalSequence: angular.copy(dialogAttributes.modalSequence),

    modalVariant: angular.copy(dialogAttributes.modalVariant),

    modalActionType: angular.copy(dialogAttributes.modalActionType),

    notificationsName,

    channelsNotificationType,

    notificationType,

    activeType: angular.copy(dialogAttributes.activeType),

    performanceMarkLabels: performanceMarkLabels.chat,

    resultType: {
      SUCCESS: 'success',
      MODERATED: 'moderated'
    },

    sendMessageErrorCode: httpResponse.sendMessageErrorCode,

    linkCardTypes: angular.copy(messageHelper.linkCardTypes),

    eventStreamParams: angular.copy(resources.eventStreamParams),

    urlParamNames: angular.copy(resources.urlParamNames),

    friendshipOriginType: angular.copy(dialogAttributes.friendshipOriginType),

    getChatDisabledReasonsByPriority(chatLibrary) {
      if (!chatLibrary || !chatLibrary.chatLayout) {
        return ['CHAT_DISABLED_REASON_UNKNOWN'];
      }

      const chatDisabledReasons = [];
      if (
        chatLibrary.isWebChatRegionalityEnabled &&
        !chatLibrary.chatLayout.isChatEnabledByRegion
      ) {
        chatDisabledReasons.push('CHAT_DISABLED_REASON_REGION');
      }

      if (!chatLibrary.chatLayout.isChatEnabledByPrivacySetting) {
        chatDisabledReasons.push('CHAT_DISABLED_REASON_PRIVACY_SETTING');
      }

      if (!chatLibrary.chatLayout.isChatEnabled) {
        chatDisabledReasons.push('CHAT_DISABLED_REASON_UNKNOWN');
      }

      return chatDisabledReasons;
    },

    getIsChatEnabled(chatLibrary) {
      return this.getChatDisabledReasonsByPriority(chatLibrary).length === 0;
    },

    getIsGroupChatEnabled(chatLibrary) {
      if (!chatLibrary.isWebChatSettingsMigrationEnabled) {
        return this.getIsChatEnabled(chatLibrary);
      }

      return this.getIsChatEnabled(chatLibrary) && chatLibrary.chatLayout?.isGroupChatEnabled;
    },

    hashOutContent(message) {
      if (message) {
        return message.replace(/\S/g, '#');
      }
      return message;
    },

    buildScrollbar(className) {
      const scrollbarElm = angular.element(document.querySelector(className));
      scrollbarElm.mCustomScrollbar({
        autoExpandScrollbar: false,
        scrollInertia: 1,
        contentTouchScroll: 1,
        mouseWheel: {
          preventDefault: true
        }
      });
    },

    updateScrollbar(selector) {
      const scrollbarElm = angular.element(document.querySelector(selector));
      scrollbarElm.mCustomScrollbar('update');
    },

    htmlEntities,

    getAssetDetails,

    buildLinkCard(value) {
      const linkContent = this.linkify(value);
      let pieceOfMsg = {
        content: linkContent,
        isCard: false
      };
      const { messageRegexs } = messageHelper;
      for (const cardType in messageRegexs) {
        if (messageRegexs.hasOwnProperty(cardType)) {
          const reg = messageRegexs[cardType];
          const params = value.match(reg);
          if (params && params.length === 2) {
            pieceOfMsg = {
              id: params[1],
              type: cardType,
              isCard: true,
              content: linkContent,
              assetDetails: getAssetDetails(value)
            };
          }
        }
      }
      this.buildEmojiPieces(pieceOfMsg);
      return pieceOfMsg;
    },

    buildEmojiPieces(message) {
      message.pieces = [];
      const { content } = message;
      const regex = messageHelper.emojiRegex;
      const { zwjRegex } = messageHelper;
      const { emojiRepRegex } = messageHelper;
      let frag;
      let emojiSequence = '';
      let isZwj = false;
      let prevIndex = 0;
      while ((frag = regex.exec(content)) !== null) {
        const newIndex = frag.index;
        const currentEmoji = frag[0];
        if (prevIndex !== newIndex) {
          if (emojiSequence) {
            message.pieces.push(emojiPiece(emojiSequence, true));
          }
          message.pieces.push(emojiPiece(content.slice(prevIndex, newIndex), false));
          emojiSequence = currentEmoji;
        } else {
          // handle merging zwj emoji sequences
          if (currentEmoji.match(zwjRegex) != null) {
            emojiSequence += '&zwj;';
            isZwj = true;
          } else if (isZwj || currentEmoji.match(emojiRepRegex) != null) {
            emojiSequence += currentEmoji;
            isZwj = false;
          } else {
            if (emojiSequence) {
              message.pieces.push(emojiPiece(emojiSequence, true));
            }
            emojiSequence = currentEmoji;
          }
        }
        prevIndex = regex.lastIndex;
      }
      if (emojiSequence) {
        message.pieces.push(emojiPiece(emojiSequence, true));
      }
      if (prevIndex < content.length) {
        message.pieces.push(emojiPiece(content.slice(prevIndex), false));
      }
    },

    // sort out linkCardMessages object for link card build next
    buildLinkCardMessages(message) {
      // sets message.linkCardMessages
      // calls buildEmojiPieces on each pieceOfMsg that is not a link card
      const content = message.parsedContent;
      if (content && content.length > 0) {
        const arrayOfMsgs = content.split(messageHelper.urlRegex);
        if (!arrayOfMsgs) {
          message.hasLinkCard = false;
          return false;
        }
        message.linkCardMessages = [];
        for (let i = 0; i < arrayOfMsgs.length; i++) {
          let value = arrayOfMsgs[i];
          let pieceOfMsg = null;
          if (value.match(messageHelper.urlRegex)) {
            pieceOfMsg = this.buildLinkCard(value);
          } else if (value && value.length > 0 && !value.match(messageHelper.onlyNewLineRegex)) {
            value = value.replace(messageHelper.removeNewLineRegex, '');
            value = this.linkify(value);
            pieceOfMsg = {
              content: value,
              isCard: false
            };
            this.buildEmojiPieces(pieceOfMsg);
          }
          if (pieceOfMsg) {
            message.linkCardMessages.push(pieceOfMsg);
          }
        }
      }
      return true;
    },

    sortFriendList(chatLibrary, friends) {
      const orderBy = $filter('orderBy');
      let onlineFriends = [];
      let offlineFriends = [];
      const friendIds = [];

      chatLibrary.friendIds.forEach(function (friendId) {
        const friend = chatLibrary.friendsDict[friendId];
        const userPresenceType =
          friend && friend.presence ? friend.presence.userPresenceType : friend.userPresenceType;
        if (userPresenceType > 0) {
          onlineFriends.push(friend);
        } else {
          offlineFriends.push(friend);
        }
        friendIds.push(friendId);
      });
      angular.forEach(friends, function (friend) {
        if (friendIds.indexOf(friend.id) < 0) {
          const userPresenceType =
            friend && friend.presence ? friend.presence.userPresenceType : friend.userPresenceType;
          if (userPresenceType > 0) {
            onlineFriends.push(friend);
          } else {
            offlineFriends.push(friend);
          }
        }
        // attached missing friendId
        if (chatLibrary.friendIds.indexOf(friend.id) < 0) {
          chatLibrary.friendIds.push(friend.id);
        }
      });

      onlineFriends = orderBy(onlineFriends, '+name');
      offlineFriends = orderBy(offlineFriends, '+name');
      friends = onlineFriends.concat(offlineFriends);
      return friends;
    },

    getScrollBarSelector(conversation, scrollType) {
      const { layoutId } = conversation;

      if (angular.isUndefined(scrollType)) {
        scrollType = conversation.scrollBarType;
      }
      switch (scrollType) {
        case dialogAttributes.scrollBarTypes.FRIENDSELECTION:
          return `#scrollbar_friend_${conversation.dialogType}_${layoutId}`;
        case dialogAttributes.scrollBarTypes.MESSAGE:
        default:
          return `#scrollbar_${conversation.dialogType}_${layoutId}`;
      }
    },

    linkify(content) {
      if (angular.isDefined(Linkify) && typeof Linkify.String === 'function') {
        return Linkify.String(content.escapeHTML());
      }
      return content;
    },

    hasLinkifyContent(text) {
      return (
        angular.isString(text) &&
        text.search('<a') >= 0 &&
        text.search('href=') >= 0 &&
        text.search('text-link') >= 0
      );
    },

    sanitizeMessage(message) {
      if (message && message.content && !message.isSanitized) {
        const rawContent = message.content;
        const escapedContent = message.content.escapeHTML();
        message.content = this.linkify(message.content);
        // Parsed content is used for preview messages (which are sanitized via string interpolation)
        // and link cards (which are sanitized later). So it's ok to set parsedContent = rawContent
        message.parsedContent = rawContent;
        if (message.content !== escapedContent) {
          message.hasLinkCard = true;
          message.hasLinkifyMessage = this.hasLinkifyContent(message.content);
          this.buildLinkCardMessages(message);
        } else {
          this.buildEmojiPieces(message);
        }
        message.isSanitized = true;
      }
    },

    sanitizeMessages(messages) {
      if (messages && messages.length > 0) {
        for (let i = 0; i < messages.length; i++) {
          const message = messages[i];
          this.sanitizeMessage(message);
        }
      }
    },

    updateConversationTitle(conversation, newTitle) {
      conversation.title = newTitle;
      conversation.conversationTitle = {
        titleForViewer: newTitle
      };
      // used for rename editor placehoder
      conversation.name = newTitle;
    },

    updateDialogStyle(dialogData, dialogLayout, chatLibrary) {
      const layout = dialogLayout.defaultStyle;
      if (layout && layout.inputStyle) {
        this.setResizeInputLayout(chatLibrary, layout.inputStyle.height, dialogData, dialogLayout);
      }
    },

    // dynamically adjust input field height and dialog height
    setResizeInputLayout(chatLibrary, inputHeight, dialogData, dialogLayout) {
      let top;
      let height;
      const { layout } = chatLibrary;
      const { topBarHeight } = layout;
      const inputMaxHeight = getDialogInputMaxHeight(inputHeight, dialogLayout, chatLibrary);
      const { bannerHeight } = layout;
      if (dialogLayout.renameEditor.isEnabled) {
        top = topBarHeight + layout.renameEditorHeight;
        height = topBarHeight + inputMaxHeight + layout.renameEditorHeight;
      } else {
        top = topBarHeight;
        height = topBarHeight + inputMaxHeight;
      }
      const dialogHeight = `${layout.dialogHeight - height}px`;
      const marginTop = dialogAttributes.dialogLayoutResetConstant.paddingOfInput / 2;
      dialogLayout.defaultStyle.dialogStyle = {
        height: dialogHeight
      };
      dialogLayout.defaultStyle.inputStyle = {
        height: inputMaxHeight
      };
      dialogLayout.defaultStyle.inputTextStyle = {
        'padding-top': marginTop
      };
    },

    calculateRightPosition(library, currentIndex) {
      const widthOfDialog = this.chatLayout.widthOfDialog + this.chatLayout.spaceOfDialog;
      const widthOfCollapsedDialog =
        this.chatLayout.widthOfCollapsedDialog + this.chatLayout.spaceOfDialog;
      let widthOfDialogs = 0;
      for (let i = 0; i < currentIndex; i++) {
        const dialogId = library.dialogIdList[i];
        const dialogLayout =
          library.dialogsLayout?.[dialogId] || angular.copy(dialogAttributes.dialogLayout);

        widthOfDialogs += dialogLayout.collapsed ? widthOfCollapsedDialog : widthOfDialog;
      }
      return widthOfDialogs;
    },

    updateDialogsPosition(library) {
      const { chatLayout } = library;
      const widthOfChatContainer = chatLayout.widthOfChat;
      for (let i = 0; i < library.dialogIdList.length; i++) {
        const dialogId = library.dialogIdList[i];
        const idOfDialog = `#${dialogId}`;
        const dialogElm = angular
          .element(document.querySelector(idOfDialog))
          .find(this.dialogLayout.dialogContainerClass);
        const widthOfDialogs = this.calculateRightPosition(library, i);
        const right = +widthOfChatContainer + widthOfDialogs + chatLayout.spaceOfDialog;
        dialogElm.css('right', right);
      }
      if (library.minimizedDialogIdList.length > 0) {
        library.chatLayout.areDialogsUpdated = true;
      }
    },

    updateFocusedDialog(library, layoutId) {
      $log.debug(` ------ focused layoutId ------ ${layoutId}`);
      library.chatLayout.focusedLayoutId = layoutId;
    },

    invalidateLinkCardsInMessageDict(placeIds, messageDictByPlaceIds) {
      placeIds.forEach(function (placeId) {
        invalidateLinkCardInPieceOfMessage(placeId, messageDictByPlaceIds);
      });
    },

    invalidatePlaceDetails(chatLibrary, placeIds) {
      placeIds.forEach(function (placeId) {
        if (!chatLibrary.placesLibrary[placeId]) {
          chatLibrary.placesLibrary[placeId] = {};
        }
        chatLibrary.placesLibrary[placeId] = {
          isInvalid: true
        };
      });
    },

    isPlaceDetailQualifiedInLibrary(placesLibrary, placeId) {
      return placesLibrary[placeId] && placesLibrary[placeId].reasonProhibited;
    },

    shouldScrollFromTop(conversation, chatLibrary) {
      return (
        chatLibrary.useOneToOneOsaContextCards &&
        conversation.osaAcknowledgementStatus === this.osaAcknowledgementStatus.UNACKNOWLEDGED
      );
    },

    getDynamicConversationId(conversation) {
      return {
        conversationId:
          conversation?.source === dialogAttributes.conversationSource.CHANNELS
            ? conversation.id
            : undefined,
        friendId:
          conversation?.source === dialogAttributes.conversationSource.FRIENDS
            ? conversation.id
            : undefined
      };
    }
  };
}

chatModule.factory('chatUtility', chatUtility);

export default chatUtility;
