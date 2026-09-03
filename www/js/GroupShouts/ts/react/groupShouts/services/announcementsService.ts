import { httpService } from 'core-utilities';
import { Document } from '@rbx/richtext';
import { MessageContent } from '../../shared/types';
import {
  AnnouncementModel,
  AnnouncementResponse,
  AnnouncementDraftResponse,
  AnnouncementDraftModel,
  AnnouncementsPageResponse,
  CreateAnnouncementDraftRequest,
  UpdateAnnouncementRequest
} from '../types';
import groupAnnouncementsConstants from '../constants/groupAnnouncementsConstants';

const parseSlate = (slate: string | null): Document | undefined => {
  if (!slate) return undefined;
  try {
    return JSON.parse(slate) as Document;
  } catch {
    return undefined;
  }
};

const mapResponseToModel = (raw: AnnouncementResponse): AnnouncementModel => {
  const reactions = raw.message.reactions ?? [];

  const originalContent: MessageContent = {
    plainText: raw.message.content.plainText ?? '',
    slate: parseSlate(raw.message.content.slate)
  };

  let content: MessageContent;
  if (raw.message.contentToDisplay?.plainText != null) {
    content = { plainText: raw.message.contentToDisplay.plainText };
  } else {
    content = originalContent;
  }

  const title = raw.nameToDisplay ?? raw.name;

  return {
    id: raw.id,
    messageId: raw.message.id,
    title,
    content,
    originalTitle: raw.name,
    originalContent,
    imageAssetId: raw.message.media?.assetId,
    formId: raw.message.form?.formId,
    customFormDefinition: raw.message.form ?? undefined,
    createdAt: raw.createdAt,
    createdBy: raw.createdBy,
    reactions
  };
};

const mapPageResponse = (
  raw: AnnouncementsPageResponse<AnnouncementResponse>
): AnnouncementsPageResponse<AnnouncementModel> => ({
  ...raw,
  data: raw.data.map(mapResponseToModel)
});

const getLatestAnnouncement = async (
  groupId: number
): Promise<AnnouncementsPageResponse<AnnouncementModel>> => {
  const urlConfig = {
    url: groupAnnouncementsConstants.urls.getLatestAnnouncementUrl(groupId),
    retryable: true,
    withCredentials: true
  };

  const { data } = await httpService.get(urlConfig);
  return mapPageResponse(data as AnnouncementsPageResponse<AnnouncementResponse>);
};

const getAnnouncements = async (
  groupId: number,
  announcementIds?: string[]
): Promise<AnnouncementsPageResponse<AnnouncementModel>> => {
  const urlConfig = {
    url: groupAnnouncementsConstants.urls.getAnnouncementsUrl(groupId),
    retryable: true,
    withCredentials: true
  };

  // ASP.NET Core's default model binder expects repeated keys
  // (`announcementIds=a&announcementIds=b`). Axios's default serializer emits
  // `announcementIds[]=a&announcementIds[]=b`, which the server drops. Build
  // the params via URLSearchParams so axios just calls `.toString()`.
  let params: URLSearchParams | undefined;
  if (announcementIds?.length) {
    const usp = new URLSearchParams();
    announcementIds.forEach(id => usp.append('announcementIds', id));
    params = usp;
  }
  const { data } = await httpService.get(urlConfig, params);
  return mapPageResponse(data as AnnouncementsPageResponse<AnnouncementResponse>);
};

/**
 * Fetch a single announcement by id. groups-api does not expose a GET-by-id endpoint; we
 * reuse the batch `GET /{groupId}/announcements?announcementIds=...` path with a one-element
 * filter. Returns null if the id is not present in the response.
 */
const getAnnouncementById = async (
  groupId: number,
  announcementId: string
): Promise<AnnouncementModel | null> => {
  const page = await getAnnouncements(groupId, [announcementId]);
  return page.data.find(a => a.id === announcementId) ?? null;
};

const mapDraftResponseToModel = (draft: AnnouncementDraftResponse): AnnouncementDraftModel => ({
  id: draft.id,
  title: draft.name,
  content: {
    plainText: draft.message.content.plainText ?? '',
    slate: parseSlate(draft.message.content.slate)
  },
  assetId: draft.message.media?.assetId,
  formId: draft.message.form?.formId,
  moderationState: draft.draftMetadata.state
});

const getUserDrafts = async (
  groupId?: number
): Promise<AnnouncementsPageResponse<AnnouncementDraftModel>> => {
  const urlConfig = {
    url: groupAnnouncementsConstants.urls.getUserDraftsUrl,
    retryable: true,
    withCredentials: true
  };

  const params = groupId ? { groupId } : undefined;
  const { data } = await httpService.get(urlConfig, params);
  const raw = data as AnnouncementsPageResponse<AnnouncementDraftResponse>;
  return {
    ...raw,
    data: raw.data.map(mapDraftResponseToModel)
  };
};

const createDraft = async (
  groupId: number,
  request: CreateAnnouncementDraftRequest
): Promise<AnnouncementDraftModel> => {
  const urlConfig = {
    url: groupAnnouncementsConstants.urls.getCreateDraftUrl(groupId),
    withCredentials: true
  };

  const { data } = await httpService.post(urlConfig, request);
  return mapDraftResponseToModel(data as AnnouncementDraftResponse);
};

/**
 * Find a single draft within the user's drafts list. Implemented as a list scan because the
 * server does not (yet) expose a real GET-by-id endpoint — every call to this function is the
 * same `getUserDrafts` request followed by a client-side filter.
 *
 * Renamed from `fetchDraftById` so callers do not assume an O(1) endpoint exists.
 */
const findDraftInUserDrafts = async (
  groupId: number,
  draftId: string
): Promise<AnnouncementDraftModel | null> => {
  const page = await getUserDrafts(groupId);
  return page.data.find(d => d.id === draftId) ?? null;
};

const updateAnnouncement = async (
  groupId: number,
  announcementId: string,
  request: UpdateAnnouncementRequest
): Promise<void> => {
  const urlConfig = {
    url: groupAnnouncementsConstants.urls.getAnnouncementUrl(groupId, announcementId),
    withCredentials: true
  };

  await httpService.patch(urlConfig, request);
};

const publishDraft = async (
  groupId: number,
  draftId: string,
  sendNotifications?: boolean
): Promise<AnnouncementModel> => {
  const urlConfig = {
    url: groupAnnouncementsConstants.urls.getPublishDraftUrl(groupId, draftId),
    withCredentials: true,
    ...(sendNotifications !== undefined && { params: { sendNotifications } })
  };

  const { data } = await httpService.post(urlConfig);
  return mapResponseToModel(data as AnnouncementResponse);
};

const deleteAnnouncement = async (groupId: number, announcementId: string): Promise<void> => {
  const urlConfig = {
    url: groupAnnouncementsConstants.urls.getAnnouncementUrl(groupId, announcementId),
    withCredentials: true
  };

  await httpService.delete(urlConfig);
};

const addReaction = async (
  groupId: number,
  announcementId: string,
  messageId: string,
  emoteId: string
): Promise<void> => {
  const urlConfig = {
    url: groupAnnouncementsConstants.urls.getAnnouncementReactionUrl(
      groupId,
      announcementId,
      messageId,
      emoteId
    ),
    withCredentials: true
  };

  await httpService.post(urlConfig);
};

const removeReaction = async (
  groupId: number,
  announcementId: string,
  messageId: string,
  emoteId: string
): Promise<void> => {
  const urlConfig = {
    url: groupAnnouncementsConstants.urls.getAnnouncementReactionUrl(
      groupId,
      announcementId,
      messageId,
      emoteId
    ),
    withCredentials: true
  };

  await httpService.delete(urlConfig);
};

export default {
  getLatestAnnouncement,
  getAnnouncements,
  getAnnouncementById,
  getUserDrafts,
  createDraft,
  findDraftInUserDrafts,
  updateAnnouncement,
  publishDraft,
  deleteAnnouncement,
  addReaction,
  removeReaction
};
