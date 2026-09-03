import chatModule from '../chatModule';

const SECONDS_PER_DAY = 60 * 60 * 24;
const SECONDS_PER_MONTH = SECONDS_PER_DAY * 30;
const SECONDS_PER_YEAR = SECONDS_PER_DAY * 365;

function contactCardController(
  $scope,
  $log,
  chatService,
  chatUtility,
  friendsService,
  profileInsightsService,
  languageResource
) {
  'ngInject';

  if (!$scope.chatLibrary.isWebChatTcEnabled) {
    return;
  }

  const friendshipOriginToDisplayMap = {
    [chatUtility.friendshipOriginType.QR_CODE]: {
      iconClass: 'chat-qr-icon',
      text: languageResource.get('Description.FromQrCode')
    },
    [chatUtility.friendshipOriginType.PHONE_CONTACT_IMPORTER]: {
      iconClass: 'chat-smartphone-icon',
      text: languageResource.get('Description.FromContacts')
    }
  };

  const calculateTimeSince = utcTimestampSeconds => {
    const nowInSeconds = new Date().getTime() / 1000;

    return {
      years: Math.floor((nowInSeconds - utcTimestampSeconds) / SECONDS_PER_YEAR),
      months: Math.floor((nowInSeconds - utcTimestampSeconds) / SECONDS_PER_MONTH),
      days: Math.floor((nowInSeconds - utcTimestampSeconds) / SECONDS_PER_DAY)
    };
  };

  $scope.removeTrustedConnection = () => {
    $scope.dismissContactCard();
    friendsService
      .removeTrustedConnection($scope.getOneToOneFriendId())
      .then(() => {
        $scope.showAlert('TrustedFriend.Toast.TrustedFriendRemoved');
      })
      .catch(() => {
        $scope.showAlert('Message.Error');
      });
  };

  const processProfileInsights = insights => {
    if (!insights || !Array.isArray(insights)) {
      return {
        profileInsightsEntries: [],
        ageCheckInsightText: undefined
      };
    }

    const processedInsights = [];
    let ageCheckInsightText;

    insights.forEach(insight => {
      if (!insight) {
        return;
      }

      if (insight.mutualFriendInsight) {
        const numMutualFriends = Object.keys(insight.mutualFriendInsight.mutualFriends ?? {})
          .length;
        if (numMutualFriends === 1) {
          processedInsights.push({
            iconClass: 'icon-friends',
            text: languageResource.get('Label.MutualFriendTitle')
          });
        } else {
          processedInsights.push({
            iconClass: 'icon-friends',
            text: languageResource.get('Label.MutualFriendsTitle', {
              numConnections: numMutualFriends
            })
          });
        }
      }

      const friendshipStartSeconds = insight.friendshipAgeInsight?.friendsSinceDateTime?.seconds;
      if (friendshipStartSeconds) {
        const processedInsight = {
          iconClass: 'chat-calendar-icon'
        };
        const { years, months, days } = calculateTimeSince(friendshipStartSeconds);
        if (years > 0) {
          if (years === 1) {
            processedInsight.text = languageResource.get('Label.ConnectedOneYear');
          } else {
            processedInsight.text = languageResource.get('Label.ConnectedNumYears', {
              num: years
            });
          }
        } else if (months > 0) {
          if (months === 1) {
            processedInsight.text = languageResource.get('Label.ConnectedOneMonth');
          } else {
            processedInsight.text = languageResource.get('Label.ConnectedNumMonths', {
              num: months
            });
          }
        } else if (days > 0) {
          if (days === 1) {
            processedInsight.text = languageResource.get('Label.ConnectedOneDay');
          } else {
            processedInsight.text = languageResource.get('Label.ConnectedNumDays', {
              num: days
            });
          }
        } else {
          processedInsight.text = languageResource.get('Label.NewFriend');
        }
        processedInsights.push(processedInsight);
      }

      const countryDisplayName =
        $scope.chatLibrary.countryRegions[insight.accountLocationInsight?.accountLocationCode]
          ?.displayName;
      if (countryDisplayName) {
        processedInsights.push({
          iconClass: 'icon-globe',
          text: countryDisplayName
        });
      }

      const accountCreationTimeSeconds =
        insight.accountCreationDateInsight?.accountCreatedDateTime?.seconds;
      if (accountCreationTimeSeconds) {
        const accountCreationDate = new Date(accountCreationTimeSeconds * 1000);
        const accountCreationYear = accountCreationDate.getFullYear();
        processedInsights.push({
          iconClass: 'chat-info-icon',
          text: languageResource.get('Label.JoinedInYear', {
            year: accountCreationYear
          })
        });
      }

      const friendshipOriginDisplay =
        friendshipOriginToDisplayMap[insight.friendRequestOriginInsight?.friendRequestOriginSource];
      if (friendshipOriginDisplay) {
        processedInsights.push(friendshipOriginDisplay);
      }

      const ageCheckInsightKey = insight.userAgeVerifiedInsight?.verifiedAgeBandLabel;
      if (ageCheckInsightKey) {
        ageCheckInsightText = languageResource.get(ageCheckInsightKey);
      }
    });

    return {
      profileInsightsEntries: processedInsights,
      ageCheckInsightText
    };
  };

  const fetchProfileInsightsForUser = userId => {
    profileInsightsService.getProfileInsights(userId).then(insightsForUser => {
      $scope.chatLibrary.friendsDict[
        $scope.getOneToOneFriendId()
      ].profileInsights = insightsForUser;
    });
  };

  const maybeFetchProfileInsights = () => {
    const userId = $scope.getOneToOneFriendId();
    if ($scope.dialogLayout?.currentDialogScreen !== 'contactCard' || !userId) {
      return;
    }

    $scope.maybeFetchCountryRegions().then(() => {
      fetchProfileInsightsForUser(userId);
    });
  };

  $scope.$watchGroup(['dialogLayout.currentDialogScreen', 'getOneToOneFriendId()'], () => {
    maybeFetchProfileInsights();
  });
  $scope.$watch(
    () => $scope.chatLibrary.friendsDict?.[$scope.getOneToOneFriendId()]?.profileInsights,
    newVal => {
      const { profileInsightsEntries, ageCheckInsightText } = processProfileInsights(newVal);
      $scope.dialogData.processedProfileInsights = profileInsightsEntries;
      $scope.dialogData.ageCheckInsightText = ageCheckInsightText;
    }
  );
  $scope.$watch('chatLibrary.countryRegions', () => {
    $scope.dialogData.processedProfileInsights = processProfileInsights(
      $scope.chatLibrary.friendsDict?.[$scope.getOneToOneFriendId()]?.profileInsights
    ).profileInsightsEntries;
  });
}

chatModule.controller('contactCardController', contactCardController);

export default contactCardController;
