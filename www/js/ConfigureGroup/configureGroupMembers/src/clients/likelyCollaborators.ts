import type {
  LikelyCollaborator,
  LikelyCollaboratorGetLikelyCollaboratorsRequest,
} from '@rbx/client-likely-collaborator-service/v1';
import { LikelyCollaboratorApi } from '@rbx/client-likely-collaborator-service/v1';
import { createClientConfiguration } from './utils';

export class LikelyCollaboratorsApiClient {
  public likelyCollaboratorApi: LikelyCollaboratorApi;

  constructor() {
    this.likelyCollaboratorApi = new LikelyCollaboratorApi(
      createClientConfiguration('likely-collaborator-service', 'bedev2'),
    );
  }

  async getLikelyCollaborators(
    userId: number,
    limit?: number,
  ): Promise<LikelyCollaborator[] | null | undefined> {
    const request: LikelyCollaboratorGetLikelyCollaboratorsRequest = {
      userId,
      limit,
    };

    return (await this.likelyCollaboratorApi.likelyCollaboratorGetLikelyCollaborators(request))
      .likelyCollaborators;
  }
}

const likelyCollaboratorsApiClient = new LikelyCollaboratorsApiClient();
export default likelyCollaboratorsApiClient;
