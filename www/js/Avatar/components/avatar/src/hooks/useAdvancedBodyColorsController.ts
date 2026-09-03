import { useState, useEffect, useCallback } from "react";
import { BodyColor } from "../avatarRules";
import { BodyPart } from "../types";

type UseAdvancedBodyColorsControllerProps = {
  bodyParts: BodyPart[];
  colorsPalette: BodyColor[];
  isColorSelected: (bodyColor: BodyColor, bodyPart: BodyPart) => boolean;
  onColorDotClicked: (bodyColor: BodyColor, bodyPart: BodyPart) => void;
  getCurrentBodyPartColor?: (bodyPart: BodyPart) => string | null;
};

type UseAdvancedBodyColorsControllerReturn = {
  selectedBodyPart: BodyPart;
  setSelectedBodyPart: (bodyPart: BodyPart) => void;
  hexInput: string;
  hexError: string;
  handleHexInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  getValidHexColor: (hex: string) => string | null;
  handleColorDotClick: (bodyColor: BodyColor) => void;
  handleColorDotKeyDown: (e: React.KeyboardEvent, bodyColor: BodyColor) => void;
};

export const validateHexColor = (hex: string): boolean => {
  // Remove # if present and check if it's a valid 6-digit hex color
  const cleanHex = hex.replace("#", "");
  return /^[0-9A-Fa-f]{6}$/.test(cleanHex);
};

export const getValidHexColor = (hex: string): string | null => {
  if (hex.trim() && validateHexColor(hex)) {
    return hex.startsWith("#") ? hex : `#${hex}`;
  }
  return null;
};

const useAdvancedBodyColorsController = ({
  bodyParts,
  colorsPalette,
  isColorSelected,
  onColorDotClicked,
  getCurrentBodyPartColor,
}: UseAdvancedBodyColorsControllerProps): UseAdvancedBodyColorsControllerReturn => {
  const [selectedBodyPart, setSelectedBodyPart] = useState<BodyPart>(bodyParts[0]!);
  const [hexInput, setHexInput] = useState<string>("");
  const [hexError, setHexError] = useState<string>("");

  // Check if any color is currently selected for the selected body part
  const isAnyColorSelected = colorsPalette.some(color => isColorSelected(color, selectedBodyPart));

  // Helper function to check if a color exists in the palette
  const isColorInPalette = useCallback(
    (hexColor: string): boolean => {
      const normalizedHex = hexColor.startsWith("#") ? hexColor : `#${hexColor}`;
      return colorsPalette.some(
        color => color.hexColor.toLowerCase() === normalizedHex.toLowerCase(),
      );
    },
    [colorsPalette],
  );

  // Populate hex input with current body part color if no palette color is selected
  useEffect(() => {
    if (!isAnyColorSelected && getCurrentBodyPartColor && selectedBodyPart) {
      if (selectedBodyPart.name === "all") {
        // For "all" body part, only populate if all individual parts have the same color
        // and that color is not in the palette
        const individualParts = bodyParts.filter(part => part.name !== "all");
        const individualColors = individualParts
          .map(part => getCurrentBodyPartColor(part))
          .filter(Boolean);

        if (individualColors.length === individualParts.length) {
          // All parts have colors, check if they're all the same
          const firstColor = individualColors[0];
          const allSameColor = individualColors.every(color => color === firstColor);

          if (allSameColor && firstColor && !isColorInPalette(firstColor)) {
            const displayColor = firstColor.startsWith("#") ? firstColor : `#${firstColor}`;
            setHexInput(displayColor);
          } else {
            setHexInput("");
          }
        } else {
          setHexInput("");
        }
      } else {
        // For individual body parts, populate if the color is not in the palette
        const currentColor = getCurrentBodyPartColor(selectedBodyPart);

        if (currentColor && !isColorInPalette(currentColor)) {
          const displayColor = currentColor.startsWith("#") ? currentColor : `#${currentColor}`;
          setHexInput(displayColor);
        } else {
          setHexInput("");
        }
      }
    } else if (isAnyColorSelected) {
      // Clear hex input if a palette color is selected
      setHexInput("");
    }
    setHexError("");
  }, [
    selectedBodyPart,
    isAnyColorSelected,
    getCurrentBodyPartColor,
    bodyParts,
    colorsPalette,
    isColorInPalette,
  ]);

  const handleHexInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      let { value } = event.target;

      // Limit input: max 7 characters if starts with #, max 6 if no #
      const hasHash = value.startsWith("#");
      const maxLength = hasHash ? 7 : 6;

      if (value.length > maxLength) {
        value = value.substring(0, maxLength);
      }

      // Only allow valid hex characters (0-9, A-F, a-f, and # at start)
      const validHexPattern = /^#?[0-9A-Fa-f]*$/;
      if (!validHexPattern.test(value)) {
        return; // Don't update if invalid characters
      }

      setHexInput(value);
      setHexError("");

      // Auto-apply when user enters 6th character of valid hex
      const cleanValue = value.replace("#", "");
      if (cleanValue.length === 6 && validateHexColor(value)) {
        // Create a BodyColor object to use with the existing onColorDotClicked handler
        const normalizedHex = value.startsWith("#") ? value : `#${value}`;
        const customBodyColor: BodyColor = {
          id: -1, // Use -1 to indicate custom color
          name: `Custom ${normalizedHex}`,
          hexColor: normalizedHex,
          brickColorId: -1, // Not used for custom colors
        };

        // Apply the color to the selected body part
        onColorDotClicked(customBodyColor, selectedBodyPart);
      }
    },
    [onColorDotClicked, selectedBodyPart],
  );

  const handleColorDotClick = useCallback(
    (bodyColor: BodyColor) => {
      onColorDotClicked(bodyColor, selectedBodyPart);
    },
    [onColorDotClicked, selectedBodyPart],
  );

  const handleColorDotKeyDown = useCallback(
    (e: React.KeyboardEvent, bodyColor: BodyColor) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onColorDotClicked(bodyColor, selectedBodyPart);
      }
    },
    [onColorDotClicked, selectedBodyPart],
  );

  return {
    selectedBodyPart,
    setSelectedBodyPart,
    hexInput,
    hexError,
    handleHexInputChange,
    getValidHexColor,
    handleColorDotClick,
    handleColorDotKeyDown,
  };
};

export default useAdvancedBodyColorsController;
