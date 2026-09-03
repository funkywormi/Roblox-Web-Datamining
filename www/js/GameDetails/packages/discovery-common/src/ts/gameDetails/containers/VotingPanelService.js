/* eslint-disable */
/**
 * This is a copy of VotingPanel.js service in the WWW repo
 * This version serves as the Control of the React migration for the VotingPanel
 * After migration, we will delete this version and use the React version only
 */

import { callBehaviour } from "@rbx/core-scripts/guac";
import { TranslationResourceProvider } from "@rbx/core-scripts/intl/translation";
import { ReviewCategoryType } from "../services/playerFeedbackService";
import { getAbsoluteUrl } from "@rbx/core-scripts/util/url";

const VotingPanelService = (function () {
  // Policy variable tracking whether we can show the total upvote/downvote counts
  let enableLikesCounts = false;
  let showPlayerFeedbackEntry = (targetValue, voteType) => {};

  /**
   * Remove the upvote/downvote counts from the data fields in the DOM
   */
  const removeCountsFromDataFields = function (votingPanel) {
    votingPanel.data("total-up-votes", "");
    votingPanel.data("total-down-votes", "");
  };

  /// <summary>
  /// Initializes the voting panel.
  /// </summary>
  var initialize = function () {
    var votingPanel = $(".voting-panel");
    if (votingPanel?.length === 0) {
      return;
    }

    // Initialize the voting buttons.
    $(".users-vote .upvote")
      .unbind()
      .click(function () {
        onVoteButtonClick($(this), true);
      });
    $(".users-vote .downvote")
      .unbind()
      .click(function () {
        onVoteButtonClick($(this), false);
      });

    // Initialize the vote bar.
    var totalUpVotes = parseInt(votingPanel.data("total-up-votes"));
    var totalDownVotes = parseInt(votingPanel.data("total-down-votes"));

    if (!enableLikesCounts) {
      removeCountsFromDataFields(votingPanel);
    }

    updateVoteBar(totalUpVotes, totalDownVotes);
  };

  /// <summary>
  /// Loads the voting service via ajax call, and then
  /// replaces the root node with the resulting HTML.
  /// </summary>
  var loadVotingService = function (rootNodeSelector, placeId) {
    const rootNode = $(rootNodeSelector);
    var url = "/games/votingservice/" + placeId;

    if (rootNode?.length === 0) {
      throw new Error("VotingPanelService.loadVotingService: Root node not found");
    }

    $.ajax({
      url: url,
      success: function (data) {
        rootNode.replaceWith(data);

        $(function () {
          initialize();
        });
      },
    });
  };

  /**
   * Check GUAC policy for whether we can show the upvote/downvote counts,
   * then call loadVotingService and load in the HTML for the voting panel.
   */
  const checkPolicyAndLoad = function (
    rootNodeSelector,
    placeId,
    showFeedbackEntry = voteType => {},
  ) {
    callBehaviour("app-policy")
      .then(response => {
        enableLikesCounts = response?.EnableAggregateLikesFavoritesCount ?? false;
      })
      .catch(() => {
        window.EventTracker?.fireEvent("VotingPanelPolicyLoadFailure");

        enableLikesCounts = false;
      })
      .finally(() => {
        loadVotingService(rootNodeSelector, placeId);
        showPlayerFeedbackEntry = showFeedbackEntry;
      });
  };

  /// <summary>
  /// Handler function for clicking on one of the vote buttons.
  /// </summary>
  /// <param name="element">The element that was clicked on.</param>
  /// <param name="voteType">The type of vote as a bool where true is upvote and false is downvote.</param>
  var onVoteButtonClick = function (element, voteType) {
    var userIsAuthenticated = $(".voting-panel").data("user-authenticated");
    if (!userIsAuthenticated) {
      displayModal("GuestUser");
      return;
    }

    var targetId = $(".voting-panel").data("target-id");
    var voteUrl = "/voting/vote?assetId=" + targetId + "&vote=";

    var altVoteUrl = $(".voting-panel").data("vote-url");
    if (altVoteUrl) {
      voteUrl = altVoteUrl;
    }

    // If the element is selected then it's already been voted for.
    // In this case, we want to unvote.
    if (
      element.hasClass("selected") ||
      element.find("i").hasClass("selected") ||
      element.find(".icon-like, .icon-dislike").hasClass("selected")
    ) {
      vote(voteUrl, null);
      showPlayerFeedbackEntry(false);
    } else {
      // Otherwise, vote normally.
      vote(voteUrl, voteType);
      showPlayerFeedbackEntry(
        true,
        voteType ? ReviewCategoryType.Upvote : ReviewCategoryType.Downvote,
      );
    }
  };

  /// <summary>
  /// Votes for an asset with the specified ID.
  /// </summary>
  /// <param name="assetId">The ID of the asset to vote for as a long.</param>
  /// <param name="vote">The type of vote as a bool where true is upvote,
  /// false is downvote, and null is no vote.</param>
  var vote = function (voteUrl, voteType) {
    $(".voting-panel .loading").show();
    $.ajax({
      type: "POST",
      url: voteUrl + voteType,
      success: onVoteSuccess,
      error: onVoteError,
    });
  };

  function normalizeKeys(obj) {
    // normalize all keys including nested objects
    var normalized = new Object();
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        var normalizedKey = key.charAt(0).toLowerCase() + key.slice(1);
        var value = obj[key];
        if (value !== null && typeof value === "object") {
          value = normalizeKeys(value);
        }
        normalized[normalizedKey] = value;
      }
    }
    return normalized;
  }

  /// <summary>
  /// Callback function for a successful ajax request from vote.
  /// </summary>
  /// <param name="response">The JSON result from the ajax request.</param>
  var onVoteSuccess = function (result) {
    var hasRBXIcon = $(".icon-like").length;

    $(".voting-panel .loading").hide();

    result = normalizeKeys(result);

    if (result.success) {
      // Vote was successfully applied. Need to redraw panel.
      setVotes(result.model.upVotes, result.model.downVotes);

      var upvoteButton = $(".voting-panel .upvote");
      var downvoteButton = $(".voting-panel .downvote");
      var usersVote = $(".users-vote");
      if (hasRBXIcon) {
        upvoteButton = $(".voting-panel .upvote .icon-like");
        downvoteButton = $(".voting-panel .downvote .icon-dislike");
      }

      // Add or remove the has-voted class from the button's parent div
      // depending on whether the user voted or unvoted.
      if (result.model.userVote !== null) {
        if (!usersVote.hasClass("has-voted")) {
          usersVote.addClass("has-voted");
        }
      } else {
        usersVote.removeClass("has-voted");
      }

      // Removing the selected tag removes the green or red
      // highlighting on the thumbgs.
      if (upvoteButton.hasClass("selected")) {
        upvoteButton.removeClass("selected");
      }

      if (downvoteButton.hasClass("selected")) {
        downvoteButton.removeClass("selected");
      }

      // Add the selected tag to either button if needed.
      if (result.model.userVote !== null) {
        if (result.model.userVote) {
          upvoteButton.addClass("selected");
        } else {
          downvoteButton.addClass("selected");
        }
      }

      // And finally modify the bar.
      updateVoteBar(result.model.upVotes, result.model.downVotes);
    } else {
      // Vote was not successfully applied, display modal.
      displayModal(result.modalType);
    }
  };

  /// <summary>
  /// Callback function for an erroneous ajax request from vote.
  /// </summary>
  /// <param name="response">The JSON result from the ajax request.</param>
  var onVoteError = function (result) {
    $(".voting-panel .loading").hide();
  };

  /**
   * Replace the upvote/downvote total counts with an upvote percentage
   */
  var replaceLikeCountsWithPercentage = function (percentUp) {
    $(".voting-panel .total-upvotes-text").text(percentUp + "%");
    $(".voting-panel .total-downvotes-text").text("");

    // new page
    $(".voting-panel #vote-up-text").text(percentUp + "%");
    $(".voting-panel #vote-down-text").text("");
  };

  /// <summary>
  /// Updates the vote bar to reflect the current percentages.
  /// </summary>
  /// <param name="upvotes">The total number of upvotes.</param>
  /// <param name="downvotes">The total number of downvotes.</param>
  var updateVoteBar = function (upvotes, downvotes, target) {
    var elem = target || $("#voting-section"),
      percentUp;
    if (!isNaN(upvotes) && !isNaN(downvotes)) {
      if (upvotes === 0) {
        percentUp = 0;
      } else if (downvotes === 0) {
        percentUp = 100;
      } else {
        percentUp = Math.floor((upvotes / (upvotes + downvotes)) * 100);
      }

      if (percentUp > 100) {
        percentUp = 100;
      }

      var voteElem = elem.find(".vote-container");
      var voteBg = voteElem.find(".vote-background");
      voteElem.find(".vote-percentage").css("width", percentUp + "%");
      if (downvotes > 0) {
        voteBg.addClass("has-votes");
      } else {
        voteBg.removeClass("has-votes");
      }
    }

    if (!enableLikesCounts) {
      replaceLikeCountsWithPercentage(percentUp);
    }
  };

  var setVotes = function (upVotes, downVotes) {
    upVotes = Roblox.NumberFormatting.abbreviatedFormat(upVotes);
    downVotes = Roblox.NumberFormatting.abbreviatedFormat(downVotes);

    // If we can show the like counts, update the text with the new counts
    if (enableLikesCounts) {
      $(".voting-panel .total-upvotes-text").text(upVotes);
      $(".voting-panel .total-downvotes-text").text(downVotes);

      // new page
      $(".voting-panel #vote-up-text").text(upVotes);
      $(".voting-panel #vote-down-text").text(downVotes);
    }

    updateVoteBar(upVotes, downVotes);
  };

  var getModalProperties = function (modalType) {
    var langMap = Roblox.Lang.VotingPanelResources;
    var intl = Roblox.Intl && langMap && new Roblox.Intl();
    var translationProvider = new TranslationResourceProvider(intl);
    var votingPanelResources = translationProvider.getTranslationResource("Feature.VotingPanel");
    var accountPageUrl = getAbsoluteUrl("/my/account?confirmemail=1");
    var returnPath = encodeURIComponent(window.location.pathname + window.location.search);
    var registerPageUrl = getAbsoluteUrl(`/NewLogin?returnUrl=${returnPath}`);

    // prepare links with labels to interpolate with message for localization
    var accountsPageLink =
      "<a href='" + accountPageUrl + "'>" + langMap["Label.AccountPageTitle"] + "</a>";
    var registerPageLink =
      "<a href='" + registerPageUrl + "'>" + langMap["Label.LoginOrRegisterPageTitle"] + "</a>";

    var modalProperties = {
      EmailIsVerified: {
        titleText: langMap["Label.EmailVerifiedTitle"],
        bodyContent: intl.f(langMap["Label.EmailVerifiedMessage"], {
          accountPageLink: accountsPageLink,
        }),
        onAccept: function () {
          window.location.href = accountPageUrl;
        },
        acceptColor: Roblox.Dialog.green,
        acceptText: langMap["Label.Accept"],
        declineText: langMap["Label.Decline"],
        allowHtmlContentInBody: true,
      },
      EmailOrPhoneIsVerified: {
        titleText: votingPanelResources.get("Label.EmailPhoneVerifiedTitle"),
        bodyContent: votingPanelResources.get("Label.EmailPhoneVerifiedMessage", {
          accountPageLink: accountsPageLink,
        }),
        onAccept: function () {
          window.location.href = accountPageUrl;
        },
        acceptColor: Roblox.Dialog.green,
        acceptText: langMap["Label.Accept"],
        declineText: langMap["Label.Decline"],
        allowHtmlContentInBody: true,
      },
      PlayGame: {
        titleText: langMap["Label.PlayGameTitle"],
        bodyContent: langMap["Label.PlayGameMessage"],
        showAccept: false,
        declineText: langMap["Label.Ok"],
      },
      UseModel: {
        titleText: langMap["Label.UseModelTitle"],
        bodyContent: langMap["Label.UseModelMessage"],
        showAccept: false,
        declineText: langMap["Label.Ok"],
      },
      InstallPlugin: {
        titleText: langMap["Label.InstallPluginTitle"],
        bodyContent: langMap["Label.InstallPluginMessage"],
        showAccept: false,
        declineText: langMap["Label.Ok"],
      },
      BuyGamePass: {
        titleText: langMap["Label.BuyGamePassTitle"],
        bodyContent: langMap["Label.BuyGamePassMessage"],
        showAccept: false,
        declineText: langMap["Label.Ok"],
      },
      FloodCheckThresholdMet: {
        titleText: langMap["Label.FloodCheckTitle"],
        bodyContent: langMap["Label.FloodCheckMessage"],
        showAccept: false,
        declineText: langMap["Label.Ok"],
      },
      GuestUser: {
        titleText: langMap["Label.GuestUserTitle"],
        bodyContent:
          "<div>" +
          langMap["Label.YouMustLoginToVote"] +
          "</div><div>" +
          intl.f(langMap["Label.GuestUserMessage"], { loginOrRegisterPageLink: registerPageLink }) +
          "</div>",
        onAccept: function () {
          window.location.href = registerPageUrl;
        },
        acceptColor: Roblox.Dialog.green,
        acceptText: langMap["Label.Login"],
        declineText: langMap["Label.Decline"],
        allowHtmlContentInBody: true,
      },
      Error: {
        titleText: langMap["Label.UnknownProblemTitle"],
        bodyContent: langMap["Label.UnknownProblemMessage"],
        showAccept: false,
        declineText: langMap["Label.Ok"],
      },
      AssetNotVoteable: {
        titleText: langMap["Label.AssetNotVoteableTitle"],
        bodyContent: langMap["Label.AssetNotVoteableMessage"],
        showAccept: false,
        declineText: langMap["Label.Ok"],
      },
    };

    return modalProperties[modalType] || modalProperties.Error;
  };

  /// <summary>
  /// Displays a modal window corresponding to the specified modal type.
  /// </summary>
  /// <param name="modalType">The modal type to display.</param>
  var displayModal = function (modalType) {
    if (!modalType) {
      return;
    }
    Roblox.Dialog.open(getModalProperties(modalType));
  };

  return {
    checkPolicyAndLoad,
  };
})();

export default VotingPanelService;
