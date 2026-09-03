import React, { useState, useEffect, useCallback } from "react";
import classNames from "classnames";
import { sendEventWithTarget } from "@rbx/core-scripts/event-stream";
import { useTranslation } from "@rbx/core-scripts/react";
import { BodyColor } from "../../../../avatarRules";
import avatarConstants from "../../../../constants/avatarConstants";
import AdvancedBodyColorsDialog from "../../../dialogs/AdvancedBodyColorsDialog";
import { useAvatarPageContext } from "../../../../contexts/AvatarPageContext";
import { useAvatarBodyColorsContext } from "../../../../contexts/AvatarBodyColorsContext";
import { useAvatarEditingAccessContext } from "../../../../contexts/AvatarEditingAccessContext";
import { BodyColorsStateV2 } from "../../../../types/bodyColors.types";

type BodyPart = {
  label: string;
  name: "all" | keyof BodyColorsStateV2;
};

export type BodyColorsProps = {
  bodyColors: BodyColorsStateV2;
  setBodyColors: React.Dispatch<React.SetStateAction<BodyColorsStateV2>>;
};

function BodyColors(): JSX.Element {
  const { translate } = useTranslation();
  const [currentColorId, setCurrentColorId] = useState<string | null>(null);

  const { bodyColors, setBodyColors, setShouldUpdateAvatarBodyColors } =
    useAvatarBodyColorsContext();

  const { isAvatarEditingBlocked } = useAvatarEditingAccessContext();

  const isColorSelected = useCallback(
    (bodyColor: BodyColor) => {
      return bodyColor.hexColor === currentColorId;
    },
    [currentColorId],
  );

  const [bodyParts] = useState<BodyPart[]>([
    { label: avatarConstants.bodyParts.all, name: "all" },
    { label: avatarConstants.bodyParts.head, name: "headColorId" },
    { label: avatarConstants.bodyParts.torso, name: "torsoColorId" },
    { label: avatarConstants.bodyParts.leftArm, name: "leftArmColorId" },
    { label: avatarConstants.bodyParts.rightArm, name: "rightArmColorId" },
    { label: avatarConstants.bodyParts.leftLeg, name: "leftLegColorId" },
    { label: avatarConstants.bodyParts.rightLeg, name: "rightLegColorId" },
  ]);

  const [colorsPalette, setColorsPalette] = useState<BodyColor[]>([]);
  const [advancedPalette, setAdvancedPalette] = useState<BodyColor[]>([]);

  // Helper to see if all body parts share the same color.
  const areAllColorsTheSame = useCallback((colors: BodyColorsStateV2) => {
    const c = colors.headColorId;
    return (
      colors.headColorId === c &&
      colors.torsoColorId === c &&
      colors.rightArmColorId === c &&
      colors.leftArmColorId === c &&
      colors.rightLegColorId === c &&
      colors.leftLegColorId === c
    );
  }, []);

  // Update currentColorId based on whether all parts share the same color.
  const updateCurrentColorId = useCallback(
    (colors: BodyColorsStateV2) => {
      if (areAllColorsTheSame(colors)) {
        setCurrentColorId(colors.headColorId);
      } else {
        setCurrentColorId(null);
      }
    },
    [areAllColorsTheSame],
  );

  // Change one body part (or all) to a given color
  const setBodyPartColor = useCallback(
    (bodyPart: BodyPart, bodyColor: BodyColor) => {
      const { hexColor } = bodyColor;
      setBodyColors(prev => {
        const updated = { ...prev };
        switch (bodyPart.name) {
          case "all":
            updated.headColorId = hexColor;
            updated.torsoColorId = hexColor;
            updated.leftArmColorId = hexColor;
            updated.rightArmColorId = hexColor;
            updated.leftLegColorId = hexColor;
            updated.rightLegColorId = hexColor;
            break;
          case "headColorId":
            updated.headColorId = hexColor;
            break;
          case "torsoColorId":
            updated.torsoColorId = hexColor;
            break;
          case "leftArmColorId":
            updated.leftArmColorId = hexColor;
            break;
          case "rightArmColorId":
            updated.rightArmColorId = hexColor;
            break;
          case "leftLegColorId":
            updated.leftLegColorId = hexColor;
            break;
          case "rightLegColorId":
            updated.rightLegColorId = hexColor;
            break;
          default:
            break;
        }
        return updated;
      });
      setShouldUpdateAvatarBodyColors(true);
    },
    [setBodyColors, setShouldUpdateAvatarBodyColors],
  );

  // Called whenever the user clicks a color dot
  const onColorDotClicked = useCallback(
    (bodyColor: BodyColor, bodyPart?: BodyPart) => {
      const allBodyParts = bodyParts[0]; // the "all" entry
      const part = bodyPart || allBodyParts;

      if (!bodyPart) {
        // "whole body" event
        sendEventWithTarget(
          avatarConstants.bodyColorEvents.event,
          avatarConstants.bodyColorEvents.contextWholeBody,
          {
            avatarChangeType: avatarConstants.bodyColorEvents.avatarChangeType,
          },
        );
      } else {
        // "advanced" event
        sendEventWithTarget(
          avatarConstants.bodyColorEvents.event,
          avatarConstants.bodyColorEvents.contextAdvanced,
          {
            avatarChangeType: avatarConstants.bodyColorEvents.avatarChangeType,
            Input: bodyPart.name,
          },
        );
      }

      setBodyPartColor(part!, bodyColor);
    },
    [bodyParts, setBodyPartColor],
  );

  // Check if a specific color is selected for the entire avatar or a body part
  const isWearingColorOnBodyPart = useCallback(
    (hexColor: string, bodyPart: BodyPart) => {
      if (bodyPart.name === "all") {
        return currentColorId === hexColor;
      }
      return bodyColors[bodyPart.name] === hexColor;
    },
    [currentColorId, bodyColors],
  );

  const [showAdvancedModal, setShowAdvancedModal] = useState(false);

  const openAdvancedBodyColors = useCallback(() => {
    setShowAdvancedModal(true);
  }, []);

  const onAdvancedModalClose = useCallback(() => {
    setShowAdvancedModal(false);
  }, []);

  // Function to get the current color for a specific body part
  const getCurrentBodyPartColor = useCallback(
    (bodyPart: BodyPart): string | null => {
      if (bodyPart.name === "all") {
        // For "all", return the color only if all parts have the same color
        if (areAllColorsTheSame(bodyColors)) {
          const color = bodyColors.headColorId;
          return color;
        }
        return null;
      }
      // For individual body parts, return the current color
      const color = bodyColors[bodyPart.name] || null;
      return color;
    },
    [bodyColors, areAllColorsTheSame],
  );

  // Whenever bodyColors changes, update currentColorId
  useEffect(() => {
    updateCurrentColorId(bodyColors);
  }, [bodyColors, updateCurrentColorId]);

  const { avatarRules, avatarDetails } = useAvatarPageContext();

  useEffect(() => {
    if (avatarRules) {
      setColorsPalette(avatarRules.basicBodyColorsPalette);
      setAdvancedPalette(avatarRules.bodyColorsPalette);
    }
  }, [avatarRules]);

  // Convert number-based body colors to hex-based body colors
  const convertBodyColorsToV2 = useCallback(
    (
      legacyBodyColors:
        | {
            headColorId: number | string;
            torsoColorId: number | string;
            rightArmColorId: number | string;
            leftArmColorId: number | string;
            rightLegColorId: number | string;
            leftLegColorId: number | string;
          }
        | {
            headColor3: string;
            torsoColor3: string;
            rightArmColor3: string;
            leftArmColor3: string;
            rightLegColor3: string;
            leftLegColor3: string;
          }
        | null
        | undefined,
    ): BodyColorsStateV2 => {
      // Return default colors if input is null/undefined
      if (!legacyBodyColors) {
        return {
          headColorId: "#FFFFFF",
          torsoColorId: "#FFFFFF",
          rightArmColorId: "#FFFFFF",
          leftArmColorId: "#FFFFFF",
          rightLegColorId: "#FFFFFF",
          leftLegColorId: "#FFFFFF",
        };
      }

      // If in Color3 format, convert to internal format
      if ("headColor3" in legacyBodyColors) {
        const color3Format = legacyBodyColors as {
          headColor3: string;
          torsoColor3: string;
          rightArmColor3: string;
          leftArmColor3: string;
          rightLegColor3: string;
          leftLegColor3: string;
        };
        return {
          headColorId: color3Format.headColor3.startsWith("#")
            ? color3Format.headColor3
            : `#${color3Format.headColor3}`,
          torsoColorId: color3Format.torsoColor3.startsWith("#")
            ? color3Format.torsoColor3
            : `#${color3Format.torsoColor3}`,
          rightArmColorId: color3Format.rightArmColor3.startsWith("#")
            ? color3Format.rightArmColor3
            : `#${color3Format.rightArmColor3}`,
          leftArmColorId: color3Format.leftArmColor3.startsWith("#")
            ? color3Format.leftArmColor3
            : `#${color3Format.leftArmColor3}`,
          rightLegColorId: color3Format.rightLegColor3.startsWith("#")
            ? color3Format.rightLegColor3
            : `#${color3Format.rightLegColor3}`,
          leftLegColorId: color3Format.leftLegColor3.startsWith("#")
            ? color3Format.leftLegColor3
            : `#${color3Format.leftLegColor3}`,
        };
      }

      // If already in V2 format (string hex colors), return as is
      if (typeof (legacyBodyColors as { headColorId?: string }).headColorId === "string") {
        const colorIdFormat = legacyBodyColors as {
          headColorId: string;
          torsoColorId: string;
          rightArmColorId: string;
          leftArmColorId: string;
          rightLegColorId: string;
          leftLegColorId: string;
        };
        return {
          headColorId: String(colorIdFormat.headColorId),
          torsoColorId: String(colorIdFormat.torsoColorId),
          rightArmColorId: String(colorIdFormat.rightArmColorId),
          leftArmColorId: String(colorIdFormat.leftArmColorId),
          rightLegColorId: String(colorIdFormat.rightLegColorId),
          leftLegColorId: String(colorIdFormat.leftLegColorId),
        };
      }

      // Convert from number IDs to hex colors by finding matching colors in palette
      const findHexColorById = (colorId: number): string => {
        const foundColor = [...colorsPalette, ...advancedPalette].find(
          color => color.brickColorId === colorId,
        );
        return foundColor?.hexColor || "#FFFFFF"; // Default to white if not found
      };

      return {
        headColorId: findHexColorById(Number(legacyBodyColors.headColorId)),
        torsoColorId: findHexColorById(Number(legacyBodyColors.torsoColorId)),
        rightArmColorId: findHexColorById(Number(legacyBodyColors.rightArmColorId)),
        leftArmColorId: findHexColorById(Number(legacyBodyColors.leftArmColorId)),
        rightLegColorId: findHexColorById(Number(legacyBodyColors.rightLegColorId)),
        leftLegColorId: findHexColorById(Number(legacyBodyColors.leftLegColorId)),
      };
    },
    [colorsPalette, advancedPalette],
  );

  useEffect(() => {
    if (avatarDetails?.bodyColor3s && (colorsPalette.length > 0 || advancedPalette.length > 0)) {
      const convertedColors = convertBodyColorsToV2(avatarDetails.bodyColor3s);
      setBodyColors(convertedColors);
      updateCurrentColorId(convertedColors);
    }
  }, [
    avatarDetails,
    setBodyColors,
    updateCurrentColorId,
    convertBodyColorsToV2,
    colorsPalette,
    advancedPalette,
  ]);

  return (
    <React.Fragment>
      <AdvancedBodyColorsDialog
        closeDialog={onAdvancedModalClose}
        isOpen={showAdvancedModal}
        onColorDotClicked={onColorDotClicked}
        colorsPalette={advancedPalette}
        isColorSelected={(bodyColor: BodyColor, bodyPart: BodyPart) => {
          return isWearingColorOnBodyPart(bodyColor.hexColor, bodyPart);
        }}
        bodyParts={bodyParts}
        getCurrentBodyPartColor={getCurrentBodyPartColor}
      />
      <div className="section-content">
        <div
          className={classNames("bodycolors-list", {
            "locked-card": isAvatarEditingBlocked,
          })}
          aria-disabled={isAvatarEditingBlocked}
        >
          {colorsPalette.map(color => (
            // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
            <div
              key={`bodycolor-${color.hexColor}`}
              className={classNames("color-dot", {
                active: isColorSelected(color),
              })}
              style={{
                backgroundColor: color.hexColor,
                opacity: isAvatarEditingBlocked ? 0.5 : 1,
                pointerEvents: isAvatarEditingBlocked ? "none" : "auto",
              }}
              onClick={() => {
                onColorDotClicked(color);
              }}
            />
          ))}
        </div>
        <button
          type="button"
          className="text-link advanced-link"
          onClick={openAdvancedBodyColors}
          style={{
            background: "none",
            border: "none",
            float: "inline-end",
            width: "auto",
            textAlign: "initial",
          }}
        >
          {translate("Action.Advanced")}
        </button>
      </div>
    </React.Fragment>
  );
}

export default BodyColors;
