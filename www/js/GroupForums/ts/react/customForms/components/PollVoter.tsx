import React, { ReactNode, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  PollDisplay,
  getErrorMessage,
  extractFieldErrors,
  SubmitResponseRequest,
  CustomForm
} from '@rbx/custom-forms';
import { Button } from '@rbx/foundation-ui';
import { httpResponseCodes } from 'core-utilities';
import type { WithTranslationsProps } from 'react-utilities';
import { Loading } from 'react-style-guide';
import { CurrentUser } from 'Roblox';
import {
  thumbnailService,
  ThumbnailTypes,
  ThumbnailAvatarHeadshotSize,
  ThumbnailStates
} from 'roblox-thumbnails';

import customFormsService from '../services/customFormsService';
import { extractServerErrors } from '../utils/errorUtils';
import queryKeys from '../utils/queryKeys';
import usePollRealtime from '../hooks/usePollRealtime';
import ConditionalTooltip from '../../shared/components/ConditionalTooltip';
import CommunityEventStream from '../../shared/utils/eventStream';
import { getPollViewButtonClickEvent } from '../../shared/userActivity/pollEventStream';

export type PollVoterProps = {
  groupId: number;
  vertical: string;
  formId: number;
  announcementId: string;
  formDefinition?: CustomForm;
  isMemberOfGroup: boolean;
  translate: WithTranslationsProps['translate'];
};

const PollVoter: React.FC<PollVoterProps> = ({
  groupId,
  vertical,
  formId,
  announcementId,
  formDefinition,
  isMemberOfGroup,
  translate
}) => {
  const queryClient = useQueryClient();
  const resultsQueryKey = queryKeys.getFormResultsKey(groupId, formId);
  const isAuthenticated = !!CurrentUser?.isAuthenticated;

  const { realtimeEnabled } = usePollRealtime({ groupId, formId });

  const { data, isLoading } = useQuery({
    queryKey: resultsQueryKey,
    queryFn: () => customFormsService.getFormResults(groupId, vertical, formId),
    enabled: !!groupId && !!formId && isAuthenticated,
    keepPreviousData: true,
    retry: (failureCount, error) => {
      const status = (error as { status?: number })?.status;
      if (status === httpResponseCodes.tooManyAttempts) return false;
      return failureCount < 3;
    },
    refetchInterval: queryData => {
      if (realtimeEnabled) return false;
      return queryData?.response ? 15000 : false;
    }
  });

  const currentUserId = CurrentUser?.isAuthenticated ? Number(CurrentUser.userId) : 0;

  const { data: avatarUrl } = useQuery({
    queryKey: queryKeys.getPollVoterAvatarKey(currentUserId),
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
      const result:
        | { thumbnail?: { state: string; imageUrl?: string } }
        | undefined = await thumbnailService.getThumbnailImage(
        ThumbnailTypes.avatarHeadshot,
        ThumbnailAvatarHeadshotSize.size48,
        undefined,
        currentUserId
      );
      return result?.thumbnail?.state === ThumbnailStates.complete
        ? result.thumbnail.imageUrl
        : undefined;
    },
    enabled: !!currentUserId,
    staleTime: 1000 * 60 * 60,
    retry: 1
  });

  const voteMutation = useMutation({
    mutationFn: (response: SubmitResponseRequest) =>
      customFormsService.submitFormResponse(groupId, vertical, formId, response.responseSpecs),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: resultsQueryKey })
  });

  const voteErrorMessage = useMemo(() => {
    if (!voteMutation.error) return undefined;
    const apiErrors = extractServerErrors(voteMutation.error);
    if (apiErrors) {
      const fieldErrors = extractFieldErrors(apiErrors);
      if (fieldErrors.length > 0) {
        return getErrorMessage(fieldErrors[0]);
      }
    }
    return translate('Validation.Error.Invalid');
  }, [voteMutation.error, translate]);

  const handleVote = useCallback(
    (response: SubmitResponseRequest) => {
      CommunityEventStream.sendEvent(
        getPollViewButtonClickEvent('vote', String(formId), 'announcement', announcementId)
      );
      voteMutation.mutate(response);
    },
    [voteMutation, formId, announcementId]
  );

  const renderVoteAction = useCallback(
    (defaultButton: ReactNode) => {
      if (isMemberOfGroup) return defaultButton;
      return (
        <ConditionalTooltip
          id={`poll-vote-join-tooltip-${formId}`}
          enabled
          position='top-center'
          containerClassName='poll-vote-tooltip-container'
          content={translate('Description.JoinCommunityFirst')}>
          <Button variant='Emphasis' size='Medium' isDisabled>
            {translate('Action.Vote')}
          </Button>
        </ConditionalTooltip>
      );
    },
    [isMemberOfGroup, formId, translate]
  );

  if (!isAuthenticated && formDefinition) {
    return (
      <div className='poll-voter'>
        <PollDisplay form={formDefinition} disabled hideDescription translate={translate} />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className='poll-voter'>
        <Loading />
      </div>
    );
  }

  if (!data?.form) {
    return null;
  }

  return (
    <div className='poll-voter'>
      <PollDisplay
        form={data.form}
        results={data.results}
        userResponse={data.response}
        onVote={data.response || !isMemberOfGroup ? undefined : handleVote}
        disabled={!isMemberOfGroup || voteMutation.isLoading}
        voterThumbnailUrl={avatarUrl}
        hideDescription
        responseCount={data.results?.totalResponses}
        renderVoteAction={renderVoteAction}
        translate={translate}
      />
      {voteErrorMessage && (
        <p className='text-caption content-alert margin-top-xsmall'>{voteErrorMessage}</p>
      )}
    </div>
  );
};

PollVoter.displayName = 'PollVoter';

export default PollVoter;
