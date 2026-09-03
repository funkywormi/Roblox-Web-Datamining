import type { DescEnum } from "@bufbuild/protobuf";
import type { Parser, PropBuilder, PropDescriptorName } from "../../types";
import {
  AutomaticSizeSchema,
  ScaleBasisSchema,
  ScaleTypeSchema,
  TextTruncateSchema,
} from "../../types";
import { reportBindingError, SduiErrorName } from "../../errors";
import { enumNumberToName, jsonEnumToString } from "../../utils/protoEnum";

import { buildDefaultProp } from "./buildDefaultProp";
import { buildStringProp } from "./buildStringProp";
import { buildNestedComponentProp } from "./buildNestedComponentProp";
import { buildFoundationIconConfigProp } from "./buildFoundationIconConfigProp";
import {
  parseAutomaticSizeProp,
  parseColorString,
  parseGradientProp,
  parseIconProp,
  parseScaleBasisProp,
  parseScaleTypeProp,
  parseStringArrayProp,
  parseTextTruncateProp,
  parseUDimProp,
  parseUDim2Prop,
  parseVector2Prop,
} from "./utils/sduiParsers";
import { buildLazyNestedComponentListProp } from "./buildLazyNestedComponentListProp";
import { buildActionProp } from "./buildActionProp";
import { buildRepeatedProp } from "./buildRepeatedProp";
import { buildStructuredProp } from "./buildStructuredProp";
import { isKnownPropDescriptor } from "./resolveDescriptorName";

/**
 * Registers a parser-aware default builder. Wraps `buildDefaultProp` with
 * the parser pre-tagged on a `{ kind: "default" }` options bag so the
 * registry stays declarative (`ColorProp: withDefaultParser(parseColorString)`).
 */
function withDefaultParser(parser: Parser): PropBuilder {
  return (propType, propValue, request) =>
    buildDefaultProp(propType, propValue, request, { kind: "default", parser });
}

/**
 * Protobuf-ES decodes enum literals to their numeric value, so this expects a number
 * and normalizes it back to its proto name before delegating to `parser`. This makes
 * it easier to develop with, easier to read in logs, and keeps it consistent with lua
 *
 * If the value is already a string, it is passed through to the parser as-is.
 */
function withEnumParser(schema: DescEnum, parser: Parser): PropBuilder {
  return withDefaultParser((value, ctx) => {
    if (value == null || typeof value === "string") {
      return parser(value, ctx);
    }

    const name = enumNumberToName(schema, value);
    if (name === undefined) {
      reportBindingError(
        SduiErrorName.FailedToParseProp,
        ctx,
        `${schema.typeName} could not resolve enum value: ${jsonEnumToString(value)}`,
      );
      return undefined;
    }

    return parser(name, ctx);
  });
}

/** `Partial` so unmapped descriptors fall through to `buildDefaultProp` and TS catches drift against `PropDescriptorName`. */
const PROP_BUILDERS: Partial<Record<PropDescriptorName, PropBuilder>> = {
  StringProp: buildStringProp,
  BoolProp: buildDefaultProp,
  Int32Prop: buildDefaultProp,
  Int64Prop: buildDefaultProp,
  FloatProp: buildDefaultProp,
  DoubleProp: buildDefaultProp,
  ColorProp: withDefaultParser(parseColorString),
  ColorStyleProp: buildDefaultProp,
  ImageStringProp: buildStringProp,
  ImageSetProp: buildStringProp,
  TypographyProp: buildDefaultProp,
  TypographyFontProp: buildDefaultProp,
  TextTruncateProp: withEnumParser(TextTruncateSchema, parseTextTruncateProp),
  FillBehaviorProp: buildDefaultProp,
  InputSizeProp: buildDefaultProp,
  IconProp: withDefaultParser(parseIconProp),
  IconSizeProp: buildDefaultProp,
  FoundationIconConfigProp: buildFoundationIconConfigProp,
  GradientProp: withDefaultParser(parseGradientProp),
  UiScaledFloatProp: buildDefaultProp,
  UiScaledUDimProp: withDefaultParser(parseUDimProp),
  UDimProp: withDefaultParser(parseUDimProp),
  UiScaledUDim2Prop: withDefaultParser(parseUDim2Prop),
  UDim2Prop: withDefaultParser(parseUDim2Prop),
  Vector2Prop: withDefaultParser(parseVector2Prop),
  FocusNavActionsProp: buildDefaultProp,
  TemplateArg: buildDefaultProp,
  AnalyticsDataField: buildDefaultProp,
  NestedComponentProp: buildNestedComponentProp,
  // TODO(web-sdui): NestedComponentListProp and LazyNestedComponentListProp share
  // the same builder today. Provide descriptor-driven lazy rendering so they defer /
  // diverge — LazyNestedComponentListProp should lazy-render, NestedComponentListProp should not.
  NestedComponentListProp: buildLazyNestedComponentListProp,
  LazyNestedComponentListProp: buildLazyNestedComponentListProp,
  StringArrayProp: withDefaultParser(parseStringArrayProp),
  ActionProp: buildActionProp,
  AutomaticSizeProp: withEnumParser(AutomaticSizeSchema, parseAutomaticSizeProp),
  ScaleTypeProp: withEnumParser(ScaleTypeSchema, parseScaleTypeProp),
  ScaleBasisProp: withEnumParser(ScaleBasisSchema, parseScaleBasisProp),
  MenuItemProp: buildStructuredProp,
  MenuItem: buildStructuredProp,
  FeedbackBannerActionProp: buildStructuredProp,
  FeedbackBannerAction: buildStructuredProp,
  ArrayOfFeedbackBannerActionsProp: buildRepeatedProp,
  SystemBannerActionProp: buildStructuredProp,
  SystemBannerAction: buildStructuredProp,
  ArrayOfSystemBannerActionsProp: buildRepeatedProp,
  GenericShareLinkData: buildStructuredProp,
  ArrayOfMenuItemProp: buildRepeatedProp,
};

export function getPropBuilder(descriptorName: string | undefined): PropBuilder {
  if (descriptorName === undefined || !isKnownPropDescriptor(descriptorName)) {
    return buildDefaultProp;
  }
  return PROP_BUILDERS[descriptorName] ?? buildDefaultProp;
}
