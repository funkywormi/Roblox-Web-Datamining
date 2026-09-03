import React, { useEffect, useMemo, useState } from "react";
import { UserProfileField, useUserProfiles } from "roblox-user-profiles";
import {
  Thumbnail2d,
  ThumbnailTypes,
  ThumbnailAvatarHeadshotSize,
  ThumbnailFormat,
} from "roblox-thumbnails";
import { Loading } from "react-style-guide";
import { AccountRecoveryError, RecoveryState } from "../../../common/request/types/accountRecovery";
import useAccountRecoveryContext from "../hooks/useAccountRecoveryContext";
import ModernCardHeader from "../../common/modernCardComponent/modernCardHeader";
import ModernCardBody from "../../common/modernCardComponent/modernCardBody";

import { LOG_PREFIX } from "../app.config";
import { formatUsername, handleContinueRecovery } from "../commonHelpers";
import { AccountRecoveryActionType } from "../store/action";
import ComponentState from "../store/componentState";

const DisambiguationPage: React.FC = () => {
  const {
    state: { eventService, requestService, recoverySessionId, userIdToRecover, resources },
    dispatch,
  } = useAccountRecoveryContext();

  const [eligibleUserIdsToRecover, setEligibleUserIdsToRecover] = useState<number[]>([]);
  const [shouldAddContactMethod, setShouldAddContactMethod] = useState(false);

  const [initializing, setInitializing] = useState(false);
  const [requestInFlight, setRequestInFlight] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);

  const userProfileFields = useMemo(() => {
    return [
      UserProfileField.Names.CombinedName,
      UserProfileField.Names.Username,
      UserProfileField.Names.DisplayName,
      UserProfileField.Names.Alias,
    ];
  }, []);

  const { data: userProfilesData } = useUserProfiles(eligibleUserIdsToRecover, userProfileFields);
  const userProfiles = userProfilesData ?? {};

  // Store usernames from the users API. For banned accounts useUserProfiles returns a placeholder,
  // so we always prefer this over the profile data for the username display.
  const [realUsernames, setRealUsernames] = useState<Record<number, string>>({});

  const onAccountSelected = async (
    userId: number,
    onSuccess: () => void,
    onError: (error: string) => void,
    on2svAbandoned: () => void,
  ) => {
    if (!requestInFlight) {
      setRequestInFlight(true);
      setRequestError(null);
      await handleContinueRecovery({
        requestService,
        resources,
        recoverySessionId,
        userId,
        onSuccess,
        onError,
        on2svAbandoned,
      });
    }
  };

  useEffect(() => {
    if (eligibleUserIdsToRecover.length === 0) return;
    const fetchRealUsernames = async () => {
      const userInfoResult = await requestService.usersApi.getUsersByIds(eligibleUserIdsToRecover);
      if (userInfoResult.isError) {
        // eslint-disable-next-line no-console
        console.warn(LOG_PREFIX, "Failed to fetch user info for ban check", userInfoResult.error);
        return;
      }
      const usernameMap: Record<number, string> = {};
      userInfoResult.value.data.forEach(userInfo => {
        usernameMap[userInfo.id] = userInfo.name;
      });
      setRealUsernames(usernameMap);
    };
    // eslint-disable-next-line no-void
    void fetchRealUsernames();
  }, [eligibleUserIdsToRecover]);

  // Loading effect
  useEffect(() => {
    const getRecoverySessionMetadata = async () => {
      setInitializing(true);
      const recoverySessionMetadataResult =
        await requestService.accountRecoveryApi.recoverySessionMetadata(recoverySessionId);
      if (recoverySessionMetadataResult.isError) {
        // eslint-disable-next-line no-console
        setInitializing(false);
        console.warn(
          LOG_PREFIX,
          "Retrieving sessions failed with error",
          recoverySessionMetadataResult.error && AccountRecoveryError,
        );
        return;
      }
      const showDisambiguationPage = () => {
        setEligibleUserIdsToRecover(recoverySessionMetadataResult.value.eligibleUserIDsToRecover);
        setInitializing(false);
        setRequestInFlight(false);
      };
      setShouldAddContactMethod(recoverySessionMetadataResult.value.shouldAddContactMethod);
      if (userIdToRecover !== null) {
        dispatch({
          type: AccountRecoveryActionType.SET_COMPONENT_STATE,
          recoverySessionState: RecoveryState.AccountVerified,
          componentState: ComponentState.RESET_PASSWORD,
          additionalComponentProps: {
            shouldAddContactMethod: recoverySessionMetadataResult.value.shouldAddContactMethod,
          },
        });
      } else if (recoverySessionMetadataResult.value.eligibleUserIDsToRecover.length === 1) {
        const eligibleUserId = recoverySessionMetadataResult.value.eligibleUserIDsToRecover[0]!;
        await onAccountSelected(
          eligibleUserId,
          () => {
            // TODO: navigate based on continue recovery result.
            dispatch({
              type: AccountRecoveryActionType.SET_USER_ID_TO_RECOVER,
              userIdToRecover: eligibleUserId,
            });
            dispatch({
              type: AccountRecoveryActionType.SET_COMPONENT_STATE,
              recoverySessionState: RecoveryState.AccountVerified,
              componentState: ComponentState.RESET_PASSWORD,
              additionalComponentProps: {
                shouldAddContactMethod: recoverySessionMetadataResult.value.shouldAddContactMethod,
              },
            });
          },
          () => {
            showDisambiguationPage();
          },
          () => {
            showDisambiguationPage();
          },
        );
      } else {
        showDisambiguationPage();
      }
    };
    // eslint-disable-next-line no-void
    void getRecoverySessionMetadata();
  }, []);

  const showResetPasswordPage = (userId: number) => {
    eventService.sendUserSelectedEvent(recoverySessionId);
    dispatch({
      type: AccountRecoveryActionType.SET_USER_ID_TO_RECOVER,
      userIdToRecover: userId,
    });
    dispatch({
      type: AccountRecoveryActionType.SET_COMPONENT_STATE,
      recoverySessionState: RecoveryState.AccountVerified,
      componentState: ComponentState.RESET_PASSWORD,
      additionalComponentProps: {
        shouldAddContactMethod,
      },
    });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>, userId: number) => {
    if (event.key === "Enter") {
      // eslint-disable-next-line no-void
      void onAccountSelected(
        userId,
        // TODO: navigate based on continue recovery result.
        () => showResetPasswordPage(userId),
        error => {
          setRequestError(error);
          setRequestInFlight(false);
        },
        () => setRequestInFlight(false),
      );
    }
  };

  const usersToDisplayElements = eligibleUserIdsToRecover.map((userId, _) => (
    <div
      className="section-content radius-medium padding-bottom-medium margin-small cursor-pointer"
      key={userId}
      role="button"
      aria-label={`Select ${userProfiles[userId]?.names?.combinedName ?? ""}`}
      onClick={() =>
        // eslint-disable-next-line no-void
        void onAccountSelected(
          userId,
          // TODO: navigate based on continue recovery result.
          () => showResetPasswordPage(userId),
          error => {
            setRequestError(error);
            setRequestInFlight(false);
          },
          () => setRequestInFlight(false),
        )
      }
      onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => handleKeyDown(event, userId)}
      tabIndex={0}
    >
      <div className="flex flex-row items-center">
        <div className="avatar avatar-headshot-md card-plain profile-avatar-image">
          <span className="avatar-card-link avatar-image-link">
            <Thumbnail2d
              containerClass="avatar-card-image profile-avatar-thumb"
              targetId={userId}
              format={ThumbnailFormat.webp}
              type={ThumbnailTypes.avatarHeadshot}
              size={ThumbnailAvatarHeadshotSize.size60}
            />
          </span>
        </div>
        <div className="padding-left-large">
          <h4 className="padding-bottom-xxsmall text-label-large">
            {userProfiles[userId]?.names?.combinedName ?? ""}
          </h4>
          <p className="text-label-medium text-align-x-left">
            {formatUsername(realUsernames[userId] ?? userProfiles[userId]?.names?.username ?? "")}
          </p>
        </div>
      </div>
    </div>
  ));

  return (
    <React.Fragment>
      {initializing ? (
        <Loading />
      ) : (
        <React.Fragment>
          <ModernCardHeader headerText={resources.Heading.ResetPassword}>
            <p className="padding-top-small">{resources.Description.ChooseAccount}</p>
          </ModernCardHeader>
          <ModernCardBody>
            {requestError && <p className="text-error xsmall">{requestError}</p>}
            <div>{usersToDisplayElements}</div>
          </ModernCardBody>
        </React.Fragment>
      )}
    </React.Fragment>
  );
};
export default DisambiguationPage;
