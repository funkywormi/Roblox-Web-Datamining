import classNames from "classnames";
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogTitle,
  Radio,
  RadioGroup,
  TextInput,
} from "@rbx/foundation-ui";
import { useTranslation } from "@rbx/core-scripts/react";
import { BodyColor } from "../../avatarRules";
import { BodyPart } from "../../types";
import useAdvancedBodyColorsController from "../../hooks/useAdvancedBodyColorsController";
import { useAvatarEditingAccessContext } from "../../contexts/AvatarEditingAccessContext";

type AdvancedBodyColorsDialogProps = {
  closeDialog: () => void;
  isOpen: boolean;
  onColorDotClicked: (bodyColor: BodyColor, bodyPart: BodyPart) => void;
  colorsPalette: BodyColor[];
  isColorSelected: (bodyColor: BodyColor, bodyPart: BodyPart) => boolean;
  bodyParts: BodyPart[];
  getCurrentBodyPartColor?: (bodyPart: BodyPart) => string | null;
};

function AdvancedBodyColorsDialog({
  closeDialog,
  isOpen,
  onColorDotClicked,
  colorsPalette,
  isColorSelected,
  bodyParts,
  getCurrentBodyPartColor,
}: AdvancedBodyColorsDialogProps): JSX.Element {
  const { translate } = useTranslation();
  const {
    selectedBodyPart,
    setSelectedBodyPart,
    hexInput,
    hexError,
    handleHexInputChange,
    getValidHexColor,
    handleColorDotClick,
    handleColorDotKeyDown,
  } = useAdvancedBodyColorsController({
    bodyParts,
    colorsPalette,
    isColorSelected,
    onColorDotClicked,
    getCurrentBodyPartColor,
  });

  const { isAvatarEditingBlocked } = useAvatarEditingAccessContext();

  const validHexColor = getValidHexColor(hexInput);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={nextOpen => {
        if (!nextOpen) closeDialog();
      }}
      size="Large"
      isModal
      hasCloseAffordance
      closeLabel={translate("Action.Close")}
    >
      <DialogContent className="advanced-body-colors">
        <DialogBody className="flex flex-col gap-medium">
          <DialogTitle className="text-title-medium content-emphasis">
            {translate("Heading.SkinToneBodyParts")}
          </DialogTitle>
          <div className="modal-body">
            <RadioGroup
              className="bodycolors-radio-list"
              value={selectedBodyPart?.name}
              onValueChange={name => {
                const nextBodyPart = bodyParts.find(part => part.name === name);
                if (nextBodyPart) {
                  setSelectedBodyPart(nextBodyPart);
                }
              }}
            >
              {bodyParts.map(bodyPart => (
                <Radio
                  key={bodyPart.name}
                  value={bodyPart.name}
                  label={translate(bodyPart.label)}
                />
              ))}
            </RadioGroup>

            <div className="bodycolors-list-sm" role="group">
              {colorsPalette.map(bodyColor => (
                <button
                  key={bodyColor.brickColorId}
                  className={classNames("color-dot", {
                    active: isColorSelected(bodyColor, selectedBodyPart),
                  })}
                  onClick={() => {
                    handleColorDotClick(bodyColor);
                  }}
                  onKeyDown={e => {
                    handleColorDotKeyDown(e, bodyColor);
                  }}
                  style={{ backgroundColor: bodyColor.hexColor }}
                  aria-label={translate("Action.SelectColor", { color: bodyColor.name })}
                  type="button"
                />
              ))}
              <div className="hex-color-input-section">
                <h4 className="hex-color-label">{translate("Label.HexColor") || "Hex Color"}</h4>
                <TextInput
                  id="hex-color-input"
                  size="Small"
                  value={hexInput}
                  onChange={handleHexInputChange}
                  placeholder={translate("Label.HexPlaceholder") || "#FF0000 or FF0000"}
                  hasError={!!hexError}
                  error={hexError || undefined}
                  leadingIconNode={
                    <div
                      className="hex-color-preview"
                      style={{ backgroundColor: validHexColor ?? "transparent" }}
                      title={validHexColor ? `Preview: ${validHexColor}` : "Color preview"}
                    />
                  }
                />
              </div>
            </div>
          </div>
        </DialogBody>
        <DialogFooter className="flex gap-small justify-end">
          <Button
            variant="Emphasis"
            size="Medium"
            onClick={closeDialog}
            isDisabled={isAvatarEditingBlocked}
          >
            {translate("Action.Done")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AdvancedBodyColorsDialog;
