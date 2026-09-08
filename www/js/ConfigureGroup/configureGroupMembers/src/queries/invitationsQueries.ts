import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateInvitationRequestModel } from '@rbx/client-organizations-service-api/v1';
import organizationApiClient from '../clients/organizationApi';
import type { InvitedMember } from '../utils/constants';
import { invalidateInvitationQueries } from './rolesQueries';

const ORGANIZATIONS_INVITATIONS_KEY = 'organizationsApi_invitations';

type TCreateInvitationProps = {
  organizationId: string;
} & CreateInvitationRequestModel;

export const useGetInvitationsByOrganizationId = (
  organizationId?: string,
  pageToken?: string,
  maxPageSize?: number,
) => {
  return useQuery({
    queryKey: [ORGANIZATIONS_INVITATIONS_KEY, organizationId, pageToken, maxPageSize],
    enabled: !!organizationId,
    placeholderData: keepPreviousData,
    queryFn: async () => {
      if (!organizationId) {
        return undefined;
      }
      return organizationApiClient.invitationClient.getInvitationsByOrganizationId(
        organizationId,
        pageToken,
        maxPageSize,
      );
    },
  });
};

export const useCreateInvitation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ organizationId, ...rest }: TCreateInvitationProps) => {
      return organizationApiClient.invitationClient.createInvitation(organizationId, rest);
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({
        queryKey: [ORGANIZATIONS_INVITATIONS_KEY, variables.organizationId],
      });
      invalidateInvitationQueries(queryClient, variables.organizationId, variables.roleIds);
    },
  });
};

type TDeleteInvitationProps = {
  organizationId: string;
  member: InvitedMember;
};

export const useDeleteInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ organizationId, member }: TDeleteInvitationProps) => {
      return organizationApiClient.invitationClient.deleteInvitationById(
        organizationId,
        member.invitationId,
      );
    },
    onSuccess: (_, variables) => {
      invalidateInvitationQueries(
        queryClient,
        variables.organizationId,
        variables.member.roles?.map((role) => role.id?.toString() ?? ''),
      );
      void queryClient.invalidateQueries({
        queryKey: [ORGANIZATIONS_INVITATIONS_KEY, variables.organizationId],
      });
    },
  });
};
