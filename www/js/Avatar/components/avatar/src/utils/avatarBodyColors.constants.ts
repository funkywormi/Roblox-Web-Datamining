import { BodyColorsState, BodyColorsStateV2 } from "../types/bodyColors.types";

const DEFAULT_AVATAR_BODY_COLORS: BodyColorsState = {
  headColorId: 0,
  torsoColorId: 0,
  rightArmColorId: 0,
  leftArmColorId: 0,
  rightLegColorId: 0,
  leftLegColorId: 0,
};

const DEFAULT_AVATAR_BODY_COLORS_V2: BodyColorsStateV2 = {
  headColorId: "",
  torsoColorId: "",
  rightArmColorId: "",
  leftArmColorId: "",
  rightLegColorId: "",
  leftLegColorId: "",
};

export { DEFAULT_AVATAR_BODY_COLORS, DEFAULT_AVATAR_BODY_COLORS_V2 };
