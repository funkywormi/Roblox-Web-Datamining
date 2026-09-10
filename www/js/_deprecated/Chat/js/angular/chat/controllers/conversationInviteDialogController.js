import { uuidService } from 'core-utilities';
import chatModule from '../chatModule';

function conversationInviteDialogController(
  $scope,
  $log,
  chatService,
  chatUtility,
  analyticsService
) {
  'ngInject';

  $scope.inviteData = {
    inviterName: '',
    members: []
  };

  $scope.getModalVariant = function () {
    const conversation = $scope.getConversation();
    if ($scope.isConversationDialogBlockedByOptIn(conversation)) {
      return chatUtility.modalVariant.CHAT_OPT_IN_INFO_CARD;
    }
    if ($scope.isConversationDialogBlockedByOsa(conversation)) {
      return chatUtility.modalVariant.OSA_CONTEXT_CARD;
    }
    return 'unknown';
  };

  $scope.getConversation = function () {
    const layoutId = $scope.chatViewModel.conversationInviteDialogLayoutId;
    return (layoutId && $scope.chatUserDict?.[layoutId]) || null;
  };

  $scope.getGroupName = function () {
    const conversation = $scope.getConversation();
    return conversation?.conversationTitle?.titleForViewer || conversation?.name || '';
  };

  const fetchParticipantsMetadata = function (conversationId) {
    if (!conversationId) {
      return;
    }

    chatService
      .getConversationsParticipantsMetadata([conversationId])
      .then(response => {
        const participantsMetadata =
          response?.conversation_participants_metadata?.[conversationId]?.participants_metadata;

        if (participantsMetadata && $scope.inviteData.members.length > 0) {
          $scope.inviteData.members = $scope.inviteData.members.map(member => {
            const metadata = participantsMetadata[member.id];
            const isBlocked = metadata?.is_blocked || false;
            const isInviter = metadata?.is_inviter || false;
            const isInvited = metadata?.is_invited || false;

            if (isInviter) {
              $scope.inviteData.inviterName = member.displayName;
            }

            return {
              ...member,
              isBlocked,
              isInviter,
              isInvited
            };
          });
        }
      })
      .catch(err => {
        $log.error('Failed to fetch participants metadata:', err);
      });
  };

  const populateMembers = function () {
    const conversation = $scope.getConversation();

    if (!conversation) {
      $log.debug(
        'No conversation found for conversationInviteDialogLayoutId:',
        $scope.chatViewModel.conversationInviteDialogLayoutId
      );
      return;
    }

    const members = [];
    if (conversation.participants && conversation.participants.length > 0) {
      conversation.participants.forEach(function (participant) {
        if (participant.id === $scope.chatLibrary?.userId) {
          return;
        }

        members.push({
          id: participant.id,
          displayName:
            participant.combined_name || participant.display_name || participant.name || '',
          username: participant.name || '',
          isBlocked: false,
          isInviter: false,
          isInvited: false
        });
      });
    }
    $scope.inviteData.members = members;

    if (conversation.source === chatUtility.conversationSource.CHANNELS) {
      fetchParticipantsMetadata(conversation.id);
    }
  };

  const generateAnalyticsEventBase = function () {
    return {
      modalSequence: chatUtility.modalSequence.CONVERSATION_LIST_OVERLAY,
      modalVariant: $scope.getModalVariant(),
      impressionId: $scope.impressionId,
      conversationId: $scope.getConversation()?.id
    };
  };

  $scope.$watch('chatViewModel.conversationInviteDialogLayoutId', function (layoutId) {
    if (layoutId) {
      populateMembers();
      $scope.impressionId = uuidService.generateRandomUuid();
      analyticsService.sendModalRenderedEvent(generateAnalyticsEventBase());
    }
  });

  $scope.joinGroup = function () {
    const conversation = $scope.getConversation();
    if (!conversation) {
      $log.debug('No conversation found for join action');
      $scope.closeConversationInviteDialog();
      return;
    }

    const analyticsEventBase = {
      ...generateAnalyticsEventBase(),
      action: analyticsService.modalActionType.PRIMARY_CTA
    };

    $log.debug('User clicked Join for group:', $scope.getGroupName());
    analyticsService.sendModalActionEvent(analyticsEventBase);

    chatService
      .recordModalSequenceResponse({
        ...chatUtility.getDynamicConversationId(conversation),
        modalSequence: chatUtility.modalSequence.CONVERSATION_LIST_OVERLAY,
        modalVariant: $scope.getModalVariant(),
        actionType: chatUtility.modalActionType.RECORD_HAS_ACCEPTED
      })
      .then(function (response) {
        if (response.status !== chatUtility.resultType.SUCCESS) {
          $log.debug('Failed to record join response:', response);
          return;
        }

        analyticsService.sendModalActionResultEvent({
          ...analyticsEventBase,
          actionResult: analyticsService.modalActionResultType.SUCCESS
        });

        conversation.osaAcknowledgementStatus = chatUtility.osaAcknowledgementStatus.ACKNOWLEDGED;
        conversation.user_opted_into_chat_messages =
          chatUtility.userChatMessageOptInStatus.OPTED_IN;

        if (conversation.source === chatUtility.conversationSource.CHANNELS) {
          $scope.fetchConversations(conversation.id);
        }
        $scope.launchDialog(conversation.layoutId, true);

        $scope.closeConversationInviteDialog();
      })
      .catch(function (error) {
        $log.debug('Error recording join response:', error);
        analyticsService.sendModalActionResultEvent({
          ...analyticsEventBase,
          actionResult: analyticsService.modalActionResultType.FAILURE
        });
        $scope.closeConversationInviteDialog();
      });
  };

  $scope.declineInvite = function () {
    const conversation = $scope.getConversation();
    if (!conversation) {
      $log.debug('No conversation found for decline action');
      $scope.closeConversationInviteDialog();
      return;
    }

    if (conversation.type !== chatUtility.conversationType.multiUserConversation) {
      $log.debug('Conversation is not a group, skipping decline action');
      $scope.closeConversationInviteDialog();
      return;
    }

    $log.debug('User declined invite for group:', $scope.getGroupName());
    const analyticsEventBase = {
      ...generateAnalyticsEventBase(),
      action: analyticsService.modalActionType.SECONDARY_CTA
    };
    analyticsService.sendModalActionEvent(analyticsEventBase);

    const promise = $scope.chatLibrary.expandedChatEnabled
      ? chatService.removeFromConversation($scope.chatLibrary.userId, conversation.id)
      : chatService.recordModalSequenceResponse({
          ...chatUtility.getDynamicConversationId(conversation),
          modalSequence: chatUtility.modalSequence.CONVERSATION_LIST_OVERLAY,
          modalVariant: $scope.getModalVariant(),
          actionType: chatUtility.modalActionType.RECORD_DONT_SHOW_AGAIN
        });

    promise
      .then(function (response) {
        if (response.status !== chatUtility.resultType.SUCCESS) {
          $log.debug('Failed to record decline response:', response);
          return;
        }

        analyticsService.sendModalActionResultEvent({
          ...analyticsEventBase,
          actionResult: analyticsService.modalActionResultType.SUCCESS
        });

        $scope.removeConversationFromUI(conversation.id);

        $scope.closeConversationInviteDialog();
      })
      .catch(function (error) {
        $log.debug('Error recording decline response:', error);
        analyticsService.sendModalActionResultEvent({
          ...analyticsEventBase,
          actionResult: analyticsService.modalActionResultType.FAILURE
        });
        $scope.closeConversationInviteDialog();
      });
  };

  $scope.dismissDialog = function () {
    analyticsService.sendModalActionEvent({
      ...generateAnalyticsEventBase(),
      action: analyticsService.modalActionType.DISMISS
    });
    $scope.closeConversationInviteDialog();
  };
}

chatModule.controller('conversationInviteDialogController', conversationInviteDialogController);

export default conversationInviteDialogController;
