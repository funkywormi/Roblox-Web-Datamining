import { httpService } from 'core-utilities';
import groupConstants from '../../shared/constants/groupConstants';

export type RelationshipType = 'Allies' | 'Enemies';

export interface AffiliateGroup {
  id: number;
  name: string;
  description: string;
  memberCount: number;
  hasVerifiedBadge: boolean;
}

export interface GetAffiliatesResponse {
  groupId: number;
  relationshipType: RelationshipType;
  totalGroupCount: number;
  relatedGroups: AffiliateGroup[];
  nextRowIndex: number | null;
}

interface GetAffiliatesParams {
  groupId: number;
  relationshipType: RelationshipType;
  startRowIndex?: number;
  maxRows?: number;
}

const DEFAULT_PAGE_SIZE = 6;
const DEFAULT_LOAD_SIZE = 50;

const getAffiliates = async ({
  groupId,
  relationshipType,
  startRowIndex = 0,
  maxRows = DEFAULT_LOAD_SIZE
}: GetAffiliatesParams): Promise<GetAffiliatesResponse> => {
  const response = await httpService.get<GetAffiliatesResponse>(
    {
      url: groupConstants.urls.getGroupAffiliatesUrl(groupId, relationshipType),
      withCredentials: true
    },
    {
      startRowIndex,
      maxRows,
      sortOrder: 'Asc'
    }
  );

  return response.data;
};

export default {
  getAffiliates,
  DEFAULT_PAGE_SIZE,
  DEFAULT_LOAD_SIZE
};
