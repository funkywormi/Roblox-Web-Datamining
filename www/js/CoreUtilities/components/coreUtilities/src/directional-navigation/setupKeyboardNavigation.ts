import { handleActionPressed } from "./gamepadUtils";
import { navigate } from "./navigate";
import { Direction } from "./types";

function handleKeyDown(event: KeyboardEvent): void {
  let direction: Direction | null = null;
  switch (event.key) {
    case "ArrowUp":
      direction = "up";
      break;
    case "ArrowDown":
      direction = "down";
      break;
    case "ArrowLeft":
      direction = "left";
      break;
    case "ArrowRight":
      direction = "right";
      break;
    case "Enter":
      handleActionPressed();
      break;

    default:
      return;
  }

  if (direction && navigate(direction)) {
    event.preventDefault();
    event.stopPropagation();
  }
}

// This is meant to simulate gamepad behavior for ease of testing,
// and should not be used in production.
export function setupKeyboardNavigation(): void {
  document.addEventListener("keydown", handleKeyDown, true);
}
