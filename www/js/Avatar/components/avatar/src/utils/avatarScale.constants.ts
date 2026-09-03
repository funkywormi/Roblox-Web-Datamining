import avatarConstants from "../constants/avatarConstants";
import { Scales } from "../constants/types";

const DEFAULT_AVATAR_SCALES: Scales = {
  height: {
    label: avatarConstants.bodyScaling.height,
    min: 0,
    max: 100,
    value: 100,
    increment: 5,
    type: avatarConstants.bodyScalingType.height,
  },
  width: {
    label: avatarConstants.bodyScaling.width,
    min: 0,
    max: 100,
    value: 100,
    increment: 5,
    type: avatarConstants.bodyScalingType.width,
  },
  head: {
    label: avatarConstants.bodyScaling.head,
    min: 0,
    max: 100,
    value: 100,
    increment: 5,
    type: avatarConstants.bodyScalingType.head,
  },
};

export default DEFAULT_AVATAR_SCALES;
