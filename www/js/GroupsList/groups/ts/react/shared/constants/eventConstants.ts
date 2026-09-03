export enum EventType {
  GroupPageClickEvent = 'groupPageClickEvent',
  GroupPageExposureEvent = 'groupPageExposureEvent',
  GroupForumsExposureEvent = 'groupForumsExposureEvent',
  GroupForumPostExposureEvent = 'groupForumPostExposureEvent',
  CmntyAgeCheckBannerShownEvent = 'cmntyAgeCheckBannerShownEvent',
  CmntyAnalyticsExposureEvent = 'cmntyAnalyticsExposureEvent',
  CmntyAnalyticsClickEvent = 'cmntyAnalyticsClickEvent'
}

export enum EventContext {
  GroupHomepage = 'groupHomepage',
  GroupForums = 'groupForums',
  ConfigureGroup = 'configureGroup',
  CommunitiesPage = 'communitiesPage',
  CommunitiesSearch = 'communitiesSearch'
}

// Community entry-point / search instrumentation (GRPS-3058/3059/3060).
export enum EntryPoint {
  CommunitiesPage = 'communitiesPage',
  CommunitiesSearch = 'communitiesSearch'
}

export enum EntryPointDetail {
  // keyword search results
  SearchResults = 'searchResults',
  // landing / suggested-keyword category rows
  CategoryBrowse = 'categoryBrowse',
  // Friends' Communities carousel on the landing page
  FriendsCommunities = 'friendsCommunities'
}

export enum SearchSurface {
  CommunitiesSearch = 'communitiesSearch'
}

export enum EventLocationTab {
  ForumsTab = 'forums'
}

export enum EventUpsellComponent {
  BannerComponent = 'Banner',
  IntrusiveModal = 'IntrusiveModal',
  CategoryUpsell = 'CategoryUpsell'
}

export enum EventTriggerReason {
  CreatePost = 'createPost',
  WriteComment = 'writeComment',
  InteractComment = 'interactComment',
  AccessRestrictedCategory = 'accessRestrictedCategory'
}
