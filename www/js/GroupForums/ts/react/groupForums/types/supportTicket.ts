import type { TTailwindIconClass } from '@rbx/foundation-tailwind/classes';
import type { TranslateFunction } from 'react-utilities';

// Foundation icons for the bug-report attachment. The (+) menu option uses the regular (outline)
// bug; the attached chip uses the filled bug (which inherits the chip's text color).
export const SUPPORT_TICKET_ICON_REGULAR_BUG: TTailwindIconClass = 'icon-regular-bug';
export const SUPPORT_TICKET_ICON_FILLED_BUG: TTailwindIconClass = 'icon-filled-bug';

// Mirrors the C# `Roblox.Groups.Client.SupportTicketDevice` enum. Serialized by name on the wire;
// groups-service maps each value to the canonical platform_type + device_type ticket metadata.
// `CurrentDevice` defers to the player's auto-detected request-context device/platform, and `Other`
// resolves to the canonical Unknown platform.
export enum SupportTicketDevice {
  CurrentDevice = 'CurrentDevice',
  Other = 'Other',
  Mac = 'Mac',
  PC = 'PC',
  IPhone = 'IPhone',
  IPad = 'IPad',
  AndroidPhone = 'AndroidPhone',
  AndroidTablet = 'AndroidTablet',
  Xbox = 'Xbox',
  PlayStation4 = 'PlayStation4',
  PlayStation5 = 'PlayStation5',
  VRHeadset = 'VRHeadset'
}

type DeviceOption = {
  device: SupportTicketDevice;
  // English source label. Brand/model names (Mac, iPhone) stay literal;
  // only fully-generic labels are localized via `labelKey`.
  label: string;
  labelKey?: string;
};

export type SupportTicketDeviceGroup = {
  // Section header translation key. Omitted for the ungrouped lead/trailing options
  // (auto-detect default + the Other catch-all), which render without a header.
  labelKey?: string;
  options: SupportTicketDevice[];
};

const DEVICE_SECTIONS: { labelKey?: string; options: DeviceOption[] }[] = [
  {
    options: [
      {
        device: SupportTicketDevice.CurrentDevice,
        label: 'This device',
        labelKey: 'Label.SupportTicketDeviceCurrent'
      }
    ]
  },
  {
    labelKey: 'Label.SupportTicketDeviceGroupComputer',
    options: [
      { device: SupportTicketDevice.PC, label: 'PC' },
      { device: SupportTicketDevice.Mac, label: 'Mac' }
    ]
  },
  {
    labelKey: 'Label.SupportTicketDeviceGroupMobile',
    options: [
      { device: SupportTicketDevice.IPhone, label: 'iPhone' },
      { device: SupportTicketDevice.IPad, label: 'iPad' },
      { device: SupportTicketDevice.AndroidPhone, label: 'Android Phone' },
      { device: SupportTicketDevice.AndroidTablet, label: 'Android Tablet' }
    ]
  },
  {
    labelKey: 'Label.SupportTicketDeviceGroupConsole',
    options: [
      { device: SupportTicketDevice.Xbox, label: 'Xbox' },
      { device: SupportTicketDevice.PlayStation4, label: 'PlayStation 4' },
      { device: SupportTicketDevice.PlayStation5, label: 'PlayStation 5' }
    ]
  },
  {
    labelKey: 'Label.SupportTicketDeviceGroupVr',
    options: [
      {
        device: SupportTicketDevice.VRHeadset,
        label: 'VR Headset',
        labelKey: 'Label.SupportTicketDeviceVrHeadset'
      }
    ]
  },
  {
    options: [
      {
        device: SupportTicketDevice.Other,
        label: 'Other',
        labelKey: 'Label.SupportTicketDeviceOther'
      }
    ]
  }
];

// Section list the dropdown renders (device ids per section) — a direct projection of the source.
export const SUPPORT_TICKET_DEVICE_GROUPS: SupportTicketDeviceGroup[] = DEVICE_SECTIONS.map(
  section => ({ labelKey: section.labelKey, options: section.options.map(option => option.device) })
);

// All options flattened, for per-device label lookup.
const DEVICE_OPTIONS: DeviceOption[] = DEVICE_SECTIONS.reduce<DeviceOption[]>(
  (options, section) => options.concat(section.options),
  []
);

// Resolves a device's display label: generic terms are localized, brand/model names stay literal.
export const getSupportTicketDeviceLabel = (
  device: SupportTicketDevice,
  translate: TranslateFunction
): string => {
  const option = DEVICE_OPTIONS.find(candidate => candidate.device === device);
  if (!option) {
    return device;
  }

  return option.labelKey ? translate(option.labelKey) : option.label;
};

// `BugReport` is the creator-communication ticket-category wire value and is intentionally retained
// (it is the backend enum value, not feature terminology).
export enum TicketCategory {
  BugReport = 'BugReport'
}

// Live Creator Helpdesk status for an attached ticket. Values are the PascalCase member names the
// backend's `StringEnumConverter` emits for the creator-communication `UserTicketStatus` proto enum
// (see groups-2 client `SupportTicketAttachmentModel.Status`) — NOT the proto `USER_TICKET_STATUS_*`
// strings used inside the support-center workspace app.
export enum UserTicketStatus {
  Invalid = 'Invalid',
  Open = 'Open',
  NeedsInfo = 'NeedsInfo',
  Fixed = 'Fixed',
  WontFix = 'WontFix',
  CantFix = 'CantFix',
  RobloxIssue = 'RobloxIssue'
}

// Message-level bug-report attachment surfaced on a fetched forum post (`ForumPost.supportTicket`,
// the groups-api `ForumPostModel.SupportTicket`). groups-api strips this entirely when a community
// lacks the `ForumsAttachmentsView` feature, so its mere presence means the status pill should show.
export type SupportTicketAttachment = {
  ticketId: string;
  universeId: number;
  ticketCategory: TicketCategory;
  status: UserTicketStatus;
};

export type SupportTicketStatusDisplay = {
  labelKey: string;
  colorClass: string;
};

const SUPPORT_TICKET_STATUS_DISPLAY: Partial<
  Record<UserTicketStatus, SupportTicketStatusDisplay>
> = {
  [UserTicketStatus.Open]: {
    labelKey: 'Label.SupportTicketStatusOpen',
    colorClass: 'content-system-emphasis'
  },
  [UserTicketStatus.NeedsInfo]: {
    labelKey: 'Label.SupportTicketStatusNeedsInfo',
    colorClass: 'content-system-warning'
  },
  [UserTicketStatus.Fixed]: {
    labelKey: 'Label.SupportTicketStatusFixed',
    colorClass: 'content-system-success'
  },
  [UserTicketStatus.WontFix]: {
    labelKey: 'Label.SupportTicketStatusWontFix',
    colorClass: 'content-muted'
  },
  [UserTicketStatus.CantFix]: {
    labelKey: 'Label.SupportTicketStatusCantFix',
    colorClass: 'content-muted'
  },
  [UserTicketStatus.RobloxIssue]: {
    labelKey: 'Label.SupportTicketStatusRobloxIssue',
    colorClass: 'content-muted'
  }
};

export const getSupportTicketStatusDisplay = (
  status: UserTicketStatus
): SupportTicketStatusDisplay | undefined => SUPPORT_TICKET_STATUS_DISPLAY[status];

// Single source of truth for "should the post show a support-ticket status pill?". True only for a
// reconciled ticket (non-empty ticketId) carrying a recognized, displayable status.
export const hasDisplayableSupportTicketStatus = (
  supportTicket?: SupportTicketAttachment | null
): supportTicket is SupportTicketAttachment =>
  !!supportTicket?.ticketId && getSupportTicketStatusDisplay(supportTicket.status) !== undefined;

export type CreateSupportTicketRequest = {
  ticketCategory: TicketCategory;
  universeId: number;
  details: string | null;
  device: SupportTicketDevice;
  shareUserInfo: boolean;
  assetIds: number[];
};

export type SupportTicketAttachmentDraft = {
  universeId: number;
  device: SupportTicketDevice;
  shareUserInfo: boolean;
  details: string;
  screenshotAssetIds?: number[];
  /** Local previews aligned with screenshotAssetIds; used only by the in-memory composer draft. */
  screenshotPreviewUrls?: Array<string | undefined>;
};
