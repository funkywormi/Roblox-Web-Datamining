export enum TUserSignalType {
  NotInterested = "NotInterested",
  NotInterestedFeedback = "NotInterestedFeedback",
}

export enum TUserSignalAssetType {
  Game = "Game",
  SponsoredGame = "SponsoredGame",
}

export enum TUserSignalValueType {
  Unknown = "Unknown",
  Bool = "Bool",
  Integer = "Integer",
  Float = "Float",
  String = "String",
  ListBool = "ListBool",
  ListInteger = "ListInteger",
  ListFloat = "ListFloat",
  ListString = "ListString",
}

export enum TUserSignalProductSurface {
  Home = "Home",
}

export type TUserSignalValue = {
  [key: string]: boolean | number | string | boolean[] | number[] | string[];
};

export type TUserSignalEntity = {
  id: string;
  assetType: TUserSignalAssetType;
  signalOrigin: {
    productSurface: string;
    topicId?: string;
    subIds: string[];
  };
};

export type TUserSignalEventData = {
  signalValue: TUserSignalValue;
  timestampMs: string;
  signalValueType: TUserSignalValueType;
  signalEntity: TUserSignalEntity;
  signalType: TUserSignalType;
  omniSessionId: string;
};

export type TPostUserSignalRequestBody = {
  userSignalEvents: TUserSignalEventData[];
};

export type TPostUserSignalResponse = {
  userSignalEventsResponse: [
    {
      eventId: string;
      statusCode: string;
      message: string;
    },
  ];
};
