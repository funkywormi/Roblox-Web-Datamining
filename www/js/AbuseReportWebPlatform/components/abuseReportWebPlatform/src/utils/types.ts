import * as z from "zod/mini";

export const DropdownItemSchema = z.object({
  label: z.string(),
  formDataValue: z.union([z.string(), z.number()]),
});
export type DropdownItemType = z.infer<typeof DropdownItemSchema>;

export const DropdownComponentSchema = z.object({
  componentType: z.literal("dropdown"),
  isOptional: z.boolean(),
  requirementMessage: z.string(),
  formDataKey: z.string(),
  dropdown: z.object({
    prompt: z.string(),
    items: z.array(DropdownItemSchema),
    placeholder: z.string(),
  }),
});
export type DropdownComponentType = z.infer<typeof DropdownComponentSchema>;

export const FreeCommentComponentSchema = z.object({
  componentType: z.literal("freeComment"),
  isOptional: z.boolean(),
  requirementMessage: z.string(),
  formDataKey: z.string(),
  freeComment: z.object({
    prompt: z.string(),
    placeholder: z.string(),
  }),
});
export type FreeCommentComponentType = z.infer<typeof FreeCommentComponentSchema>;

export const LinkSchema = z.object({
  label: z.string(),
  linkButtonLabel: z.string(),
  url: z.string(),
});
export type LinkType = z.infer<typeof LinkSchema>;

export const LinkComponentSchema = z.object({
  componentType: z.literal("link"),
  isOptional: z.optional(z.boolean()), // Unnecessary but included for consistency across components
  requirementMessage: z.optional(z.string()), // Unnecessary but included for consistency across components
  formDataKey: z.optional(z.string()), // Unnecessary but included for consistency across components
  link: LinkSchema,
});
export type LinkComponentType = z.infer<typeof LinkComponentSchema>;

export const ParagraphLinksSchema = z.record(z.string(), LinkSchema);
export type ParagraphLinksType = z.infer<typeof ParagraphLinksSchema> | null;

export const ParagraphComponentSchema = z.object({
  componentType: z.literal("paragraph"),
  isOptional: z.optional(z.boolean()), // Unnecessary but included for consistency across components
  requirementMessage: z.optional(z.string()), // Unnecessary but included for consistency across components
  formDataKey: z.optional(z.string()), // Unnecessary but included for consistency across components
  paragraph: z.object({
    text: z.string(),
    links: z.nullish(ParagraphLinksSchema),
  }),
});
export type ParagraphComponentType = z.infer<typeof ParagraphComponentSchema>;

export const ReminderComponentSchema = z.object({
  componentType: z.literal("reminder"),
  isOptional: z.optional(z.boolean()), // Unnecessary but included for consistency across components
  requirementMessage: z.optional(z.string()), // Unnecessary but included for consistency across components
  formDataKey: z.optional(z.string()), // Unnecessary but included for consistency across components
});
export type ReminderComponentType = z.infer<typeof ReminderComponentSchema>;

export const SelectorComponentSchema = z.object({
  componentType: z.literal("selector"),
  isOptional: z.boolean(),
  requirementMessage: z.string(),
  formDataKey: z.string(),
  selector: z.object({
    prompt: z.string(),
  }),
});
export type SelectorComponentType = z.infer<typeof SelectorComponentSchema>;

export const ComponentTypesSchema = z.union([
  DropdownComponentSchema,
  FreeCommentComponentSchema,
  LinkComponentSchema,
  ParagraphComponentSchema,
  ReminderComponentSchema,
  SelectorComponentSchema,
]);
export type ComponentTypes = z.infer<typeof ComponentTypesSchema>;

export const BeduiConfigurableComponentListSchema = z.object({
  type: z.literal("configurableComponentList"),
  configurableComponentList: z.object({
    components: z.array(ComponentTypesSchema),
  }),
});
export type BeduiConfigurableComponentListType = z.infer<
  typeof BeduiConfigurableComponentListSchema
>;

export const BeduiInnerContentConfigSchema = BeduiConfigurableComponentListSchema;
export type BeduiInnerContentConfigType = z.infer<typeof BeduiInnerContentConfigSchema>;

export const BeduiNodeSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  actionInfo: z.object({
    actionLabel: z.optional(z.string()),
    predefinedNextStepId: z.number(),
    shouldSubmit: z.optional(z.boolean()),
  }),
  stepId: z.number(),
  internalStepName: z.string(),
  isCompletionStep: z.optional(z.boolean()),
  innerContentConfig: z.nullable(BeduiInnerContentConfigSchema),
  footerContentConfig: z.nullish(BeduiInnerContentConfigSchema),
});
export type BeduiNodeType = z.infer<typeof BeduiNodeSchema>;

export const BeduiResponseDataSchema = z.object({
  rootStepId: z.number(),
  nodes: z.array(BeduiNodeSchema),
});
export type BeduiResponseDataType = z.infer<typeof BeduiResponseDataSchema>;

export const BeduiMappedNodesDataSchema = z.object({
  rootStepId: z.number(),
  stepIdToNodeMap: z.map(z.number(), BeduiNodeSchema),
});
export type BeduiMappedNodesDataType = z.infer<typeof BeduiMappedNodesDataSchema>;

// Model referencing abuse-reporting-web-subsite
// https://sourcegraph.rbx.com/github.rbx.com/Roblox/abuse-reporting-web-subsite/-/blob/services/abuse-reporting-web-subsite/src/ViewModels/Shared/AbuseReportPayloadModel.cs
export type AbuseReportLegacyPayloadModel = {
  Comment: string;
  Id: string;
  StringId?: string;
  ReportCategory: string;
  RedirectUrl: string;
  ConversationId?: string;
  ForumPostId?: string;
  AssetType?: string; // This is for the item asset type in the report
  AssetTypeId?: string; // This is for the item asset type id in the report where name doesn't work
};

export type Tag = {
  valueList?: { data?: string }[];
};

export type TagMap = Record<string, Tag>;

export type ArwpReminderRenderProps = {
  title?: string;
  subtitle?: string;
  message?: string;
  thumbnailProps?: {
    containerClass: string;
    size: string;
    targetId: string;
    type: string;
  };
};
