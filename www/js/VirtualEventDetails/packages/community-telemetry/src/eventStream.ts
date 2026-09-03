import { create, DescMessage } from "@bufbuild/protobuf";
import { Message, Schema } from "@rbx/event-stream-v2";
import { WebEventBase } from "@rbx/event-stream-proto/event/web_event_base_pb";
import { uuidService } from "@rbx/core-scripts/legacy/core-utilities";
import { EnvironmentUrls } from "@rbx/core-scripts/legacy/Roblox";

import {
  CmntyAgeCheckBannerShownEventSchema,
  CmntyAgeCheckBannerShownEvent,
} from "@rbx/event-stream-proto/eventstream/usercommunities/cmnty_age_check_banner_shown_event_pb";
import {
  CmntyAgeCheckClickEventSchema,
  CmntyAgeCheckClickEvent,
} from "@rbx/event-stream-proto/eventstream/usercommunities/cmnty_age_check_click_event_pb";
import {
  CmntySessionStartEventSchema,
  CmntySessionStartEvent,
} from "@rbx/event-stream-proto/eventstream/usercommunities/cmnty_session_start_event_pb";
import {
  CmntySessionEndEventSchema,
  CmntySessionEndEvent,
} from "@rbx/event-stream-proto/eventstream/usercommunities/cmnty_session_end_event_pb";
import {
  CmntyActivityTimeSliceEventSchema,
  CmntyActivityTimeSliceEvent,
} from "@rbx/event-stream-proto/eventstream/usercommunities/cmnty_activity_time_slice_event_pb";
import {
  CmntyPollCreateShownEventSchema,
  CmntyPollCreateShownEvent,
} from "@rbx/event-stream-proto/eventstream/usercommunities/cmnty_poll_create_shown_event_pb";
import {
  CmntyPollCreationButtonClickEventSchema,
  CmntyPollCreationButtonClickEvent,
} from "@rbx/event-stream-proto/eventstream/usercommunities/cmnty_poll_creation_button_click_event_pb";
import {
  CmntyPollViewButtonClickEventSchema,
  CmntyPollViewButtonClickEvent,
} from "@rbx/event-stream-proto/eventstream/usercommunities/cmnty_poll_view_button_click_event_pb";
import {
  CmntyExperienceServerSectionShownEventSchema,
  CmntyExperienceServerSectionShownEvent,
} from "@rbx/event-stream-proto/eventstream/usercommunities/cmnty_experience_server_section_shown_event_pb";
import {
  CmntyExperienceServerSectionClickEventSchema,
  CmntyExperienceServerSectionClickEvent,
} from "@rbx/event-stream-proto/eventstream/usercommunities/cmnty_experience_server_section_click_event_pb";
import {
  CmntyExperienceServerSectionJoinEventSchema,
  CmntyExperienceServerSectionJoinEvent,
} from "@rbx/event-stream-proto/eventstream/usercommunities/cmnty_experience_server_section_join_event_pb";
import {
  CmntyAnnouncementCreatePageShownEventSchema,
  CmntyAnnouncementCreatePageShownEvent,
} from "@rbx/event-stream-proto/eventstream/usercommunities/cmnty_announcement_create_page_shown_event_pb";
import {
  CmntyAnnouncementCreatePageButtonClickEventSchema,
  CmntyAnnouncementCreatePageButtonClickEvent,
} from "@rbx/event-stream-proto/eventstream/usercommunities/cmnty_announcement_create_page_button_click_event_pb";
import {
  CmntyAnnouncementCreatePageBannerMessageShownEventSchema,
  CmntyAnnouncementCreatePageBannerMessageShownEvent,
} from "@rbx/event-stream-proto/eventstream/usercommunities/cmnty_announcement_create_page_banner_message_shown_event_pb";
import {
  CmntyAnnouncementDeleteBannerMessageShownEventSchema,
  CmntyAnnouncementDeleteBannerMessageShownEvent,
} from "@rbx/event-stream-proto/eventstream/usercommunities/cmnty_announcement_delete_banner_message_shown_event_pb";
import {
  CmntyAnnouncementOverflowMenuButtonClickEventSchema,
  CmntyAnnouncementOverflowMenuButtonClickEvent,
} from "@rbx/event-stream-proto/eventstream/usercommunities/cmnty_announcement_overflow_menu_button_click_event_pb";
import {
  CmntyAnnouncementReactionToggledEventSchema,
  CmntyAnnouncementReactionToggledEvent,
} from "@rbx/event-stream-proto/eventstream/usercommunities/cmnty_announcement_reaction_toggled_event_pb";
import {
  CmntyAnnouncementViewedEventSchema,
  CmntyAnnouncementViewedEvent,
} from "@rbx/event-stream-proto/eventstream/usercommunities/cmnty_announcement_viewed_event_pb";
import {
  GroupPageExposureEventSchema,
  GroupPageExposureEvent,
} from "@rbx/event-stream-proto/eventstream/usercommunities/group_page_exposure_event_pb";
import {
  GroupPageClickEventSchema,
  GroupPageClickEvent,
} from "@rbx/event-stream-proto/eventstream/usercommunities/group_page_click_event_pb";
import {
  CmntyEntrypointExposureEventSchema,
  CmntyEntrypointExposureEvent,
} from "@rbx/event-stream-proto/eventstream/usercommunities/cmnty_entrypoint_exposure_event_pb";
import {
  CmntyEntrypointClickEventSchema,
  CmntyEntrypointClickEvent,
} from "@rbx/event-stream-proto/eventstream/usercommunities/cmnty_entrypoint_click_event_pb";
import {
  CmntySearchConductedEventSchema,
  CmntySearchConductedEvent,
} from "@rbx/event-stream-proto/eventstream/usercommunities/cmnty_search_conducted_event_pb";
import {
  CmntySearchResultsReturnedEventSchema,
  CmntySearchResultsReturnedEvent,
} from "@rbx/event-stream-proto/eventstream/usercommunities/cmnty_search_results_returned_event_pb";
import {
  CmntyHomepageScrollExposureEventSchema,
  CmntyHomepageScrollExposureEvent,
} from "@rbx/event-stream-proto/eventstream/usercommunities/cmnty_homepage_scroll_exposure_event_pb";

import { EventStreamClient, webEventBase } from "./eventStreamClient";

// refreshed on "app/browser" restart, or manually from code as needed very much like a session id
let ImpressionId = uuidService.generateRandomUuid();

export const getImpressionId = (): string => ImpressionId;
export const updateImpressionId = (): string => {
  ImpressionId = uuidService.generateRandomUuid();
  return ImpressionId;
};

export type StructuredEvent = {
  schema: Schema<DescMessage>;
  message: Message<DescMessage>;
};

export const getMetricEvent = <T extends DescMessage>(
  schema: Schema<T>,
  init: Message<T>,
): StructuredEvent => {
  const message = create(schema, init);

  return {
    schema,
    message,
  };
};

const client: EventStreamClient = new EventStreamClient({
  baseUrl: EnvironmentUrls.apiGatewayUrl,
});

type SafeEvent<T> = Omit<
  T,
  "$typeName" | "groupId" | "emoteId" | "timeSinceLastAction" | "sequenceNumber" | "sessionDuration"
> & { groupId: number } & {
  emoteId?: string;
  timeSinceLastAction?: number;
  sequenceNumber?: number;
  sessionDuration?: number;
};

export type AgeCheckClickEvent = SafeEvent<CmntyAgeCheckClickEvent>;

export type PollCreationButtonClicked = "create" | "save" | "remove";
export type PollViewButtonClicked = "vote";
export type PollViewSourceType = "announcement";

export type ExperienceServerSectionShownEvent = Omit<
  CmntyExperienceServerSectionShownEvent,
  "$typeName" | "groupId"
> & { groupId: number };

export type ExperienceServerSectionClickEvent = Omit<
  CmntyExperienceServerSectionClickEvent,
  "$typeName" | "groupId"
> & { groupId: number };

export type ExperienceServerSectionJoinEvent = Omit<
  CmntyExperienceServerSectionJoinEvent,
  "$typeName" | "groupId" | "universeId"
> & { groupId: number; universeId: number };

export type GroupPageExposureEventParams = Omit<GroupPageExposureEvent, "$typeName" | "groupId"> & {
  groupId: number;
};

export type GroupPageClickEventParams = Omit<
  GroupPageClickEvent,
  "$typeName" | "groupId" | "enterFrom"
> & {
  groupId: number;
};

export type CmntyEntrypointExposureEventParams = Omit<
  CmntyEntrypointExposureEvent,
  "$typeName" | "groupId" | "resultIndex"
> & { groupId?: number; resultIndex?: number };

export type CmntyEntrypointClickEventParams = Omit<
  CmntyEntrypointClickEvent,
  "$typeName" | "groupId" | "groupSize" | "resultIndex"
> & { groupId?: number; groupSize?: number; resultIndex?: number };

export type CmntySearchConductedEventParams = Omit<CmntySearchConductedEvent, "$typeName">;

export type CmntySearchResultsReturnedEventParams = Omit<
  CmntySearchResultsReturnedEvent,
  "$typeName" | "totalResults"
> & { totalResults?: number };

export const CommunityMetric = {
  AgeCheckBannerShown: (msg: SafeEvent<CmntyAgeCheckBannerShownEvent>) =>
    getMetricEvent(
      CmntyAgeCheckBannerShownEventSchema,
      msg as unknown as CmntyAgeCheckBannerShownEvent,
    ),
  AgeCheckClick: (msg: SafeEvent<CmntyAgeCheckClickEvent>) =>
    getMetricEvent(CmntyAgeCheckClickEventSchema, msg as unknown as CmntyAgeCheckClickEvent),
  ActivityTimeSlice: (msg: SafeEvent<CmntyActivityTimeSliceEvent>) =>
    getMetricEvent(
      CmntyActivityTimeSliceEventSchema,
      msg as unknown as CmntyActivityTimeSliceEvent,
    ),
  SessionStart: (msg: SafeEvent<CmntySessionStartEvent>) =>
    getMetricEvent(CmntySessionStartEventSchema, msg as unknown as CmntySessionStartEvent),
  SessionEnd: (msg: SafeEvent<CmntySessionEndEvent>) =>
    getMetricEvent(CmntySessionEndEventSchema, msg as unknown as CmntySessionEndEvent),
  PollCreateShown: (msg: SafeEvent<CmntyPollCreateShownEvent>) =>
    getMetricEvent(CmntyPollCreateShownEventSchema, msg as unknown as CmntyPollCreateShownEvent),
  PollCreationButtonClick: (msg: SafeEvent<CmntyPollCreationButtonClickEvent>) =>
    getMetricEvent(
      CmntyPollCreationButtonClickEventSchema,
      msg as unknown as CmntyPollCreationButtonClickEvent,
    ),
  PollViewButtonClick: (msg: SafeEvent<CmntyPollViewButtonClickEvent>) =>
    getMetricEvent(
      CmntyPollViewButtonClickEventSchema,
      msg as unknown as CmntyPollViewButtonClickEvent,
    ),
  ExperienceServerSectionShown: (msg: ExperienceServerSectionShownEvent) =>
    getMetricEvent(
      CmntyExperienceServerSectionShownEventSchema,
      msg as unknown as CmntyExperienceServerSectionShownEvent,
    ),
  ExperienceServerSectionClick: (msg: ExperienceServerSectionClickEvent) =>
    getMetricEvent(
      CmntyExperienceServerSectionClickEventSchema,
      msg as unknown as CmntyExperienceServerSectionClickEvent,
    ),
  ExperienceServerSectionJoin: (msg: ExperienceServerSectionJoinEvent) =>
    getMetricEvent(
      CmntyExperienceServerSectionJoinEventSchema,
      msg as unknown as CmntyExperienceServerSectionJoinEvent,
    ),
  AnnouncementCreatePageShown: (msg: SafeEvent<CmntyAnnouncementCreatePageShownEvent>) =>
    getMetricEvent(
      CmntyAnnouncementCreatePageShownEventSchema,
      msg as unknown as CmntyAnnouncementCreatePageShownEvent,
    ),
  AnnouncementCreatePageButtonClick: (
    msg: SafeEvent<CmntyAnnouncementCreatePageButtonClickEvent>,
  ) =>
    getMetricEvent(
      CmntyAnnouncementCreatePageButtonClickEventSchema,
      msg as unknown as CmntyAnnouncementCreatePageButtonClickEvent,
    ),
  AnnouncementCreatePageBannerMessageShown: (
    msg: SafeEvent<CmntyAnnouncementCreatePageBannerMessageShownEvent>,
  ) =>
    getMetricEvent(
      CmntyAnnouncementCreatePageBannerMessageShownEventSchema,
      msg as unknown as CmntyAnnouncementCreatePageBannerMessageShownEvent,
    ),
  AnnouncementDeleteBannerMessageShown: (
    msg: SafeEvent<CmntyAnnouncementDeleteBannerMessageShownEvent>,
  ) =>
    getMetricEvent(
      CmntyAnnouncementDeleteBannerMessageShownEventSchema,
      msg as unknown as CmntyAnnouncementDeleteBannerMessageShownEvent,
    ),
  AnnouncementOverflowMenuButtonClick: (
    msg: SafeEvent<CmntyAnnouncementOverflowMenuButtonClickEvent>,
  ) =>
    getMetricEvent(
      CmntyAnnouncementOverflowMenuButtonClickEventSchema,
      msg as unknown as CmntyAnnouncementOverflowMenuButtonClickEvent,
    ),
  AnnouncementReactionToggled: (msg: SafeEvent<CmntyAnnouncementReactionToggledEvent>) =>
    getMetricEvent(
      CmntyAnnouncementReactionToggledEventSchema,
      msg as unknown as CmntyAnnouncementReactionToggledEvent,
    ),
  AnnouncementViewed: (msg: SafeEvent<CmntyAnnouncementViewedEvent>) =>
    getMetricEvent(
      CmntyAnnouncementViewedEventSchema,
      msg as unknown as CmntyAnnouncementViewedEvent,
    ),
  GroupPageExposure: (msg: GroupPageExposureEventParams) =>
    getMetricEvent(GroupPageExposureEventSchema, msg as unknown as GroupPageExposureEvent),
  GroupPageClick: (msg: GroupPageClickEventParams) =>
    getMetricEvent(GroupPageClickEventSchema, msg as unknown as GroupPageClickEvent),
  CmntyEntrypointExposure: (msg: CmntyEntrypointExposureEventParams) =>
    getMetricEvent(
      CmntyEntrypointExposureEventSchema,
      msg as unknown as CmntyEntrypointExposureEvent,
    ),
  CmntyEntrypointClick: (msg: CmntyEntrypointClickEventParams) =>
    getMetricEvent(CmntyEntrypointClickEventSchema, msg as unknown as CmntyEntrypointClickEvent),
  CmntySearchConducted: (msg: CmntySearchConductedEventParams) =>
    getMetricEvent(CmntySearchConductedEventSchema, msg as unknown as CmntySearchConductedEvent),
  CmntySearchResultsReturned: (msg: CmntySearchResultsReturnedEventParams) =>
    getMetricEvent(
      CmntySearchResultsReturnedEventSchema,
      msg as unknown as CmntySearchResultsReturnedEvent,
    ),
  HomepageScrollExposure: (msg: SafeEvent<CmntyHomepageScrollExposureEvent>) =>
    getMetricEvent(
      CmntyHomepageScrollExposureEventSchema,
      msg as unknown as CmntyHomepageScrollExposureEvent,
    ),
};

class CommunityEventStream {
  private static readonly withWebBase = <T extends DescMessage>(
    message: Message<T>,
  ): Message<T> & { webEventBase: WebEventBase } => {
    const webEventBaseFields: WebEventBase = webEventBase();
    const messageWithBase = { ...message, webEventBase: webEventBaseFields };
    return messageWithBase;
  };

  private static readonly sendEventStreamMetric = <T extends DescMessage>(
    schema: Schema<T>,
    message: Message<T>,
  ): Promise<void> =>
    client.sendEvent(schema, CommunityEventStream.withWebBase(message) as unknown as Message<T>);

  static sendEvent = <T extends DescMessage>(event: StructuredEvent): void => {
    // eslint-disable-next-line no-void
    void CommunityEventStream.sendEventStreamMetric(
      event.schema,
      CommunityEventStream.withWebBase(event.message) as unknown as Message<T>,
    );
  };
}

export default CommunityEventStream;
