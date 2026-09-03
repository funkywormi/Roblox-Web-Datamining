import {
  getAnalogStickDirection,
  getDpadDirection,
  handleActionPressed,
  handleCancelPressed,
  isActionPressed,
  isCancelPressed,
} from "./gamepadUtils";
import { navigate } from "./navigate";
import { Direction } from "./types";

const GAMEPAD_POLL_INTERVAL = 50; // ms
const GAMEPAD_INITIAL_DELAY_MS = 500; // Initial delay before repeating
const GAMEPAD_REPEAT_DELAY_MS = 300; // Delay between repeated navigation when holding

const gamepads: Record<number, Gamepad | null> = {};

let previousActiveGamepads: Gamepad[] = [];

let gamepadPollIntervalId: number | null = null;

let lastGamepadNavTime = 0;
let currentDirection: Direction | null = null;
let isInitialPress = true;

function handleGamepadInput(): void {
  const now = Date.now();
  const gamepadsSnapshot = navigator.getGamepads();

  // Use filter to create array of non-null gamepads
  const activeGamepads = Array.from(gamepadsSnapshot).filter(g => g !== null);

  let newDirection: Direction | null = null;

  for (const gp of activeGamepads) {
    const previousGp = previousActiveGamepads.find(g => g.index === gp.index);

    // Handle Action pressed.
    if (isActionPressed(gp, previousGp)) {
      handleActionPressed();
    }

    // Handle Cancel pressed.
    if (isCancelPressed(gp, previousGp)) {
      handleCancelPressed();
    }
    const direction = getDpadDirection(gp) ?? getAnalogStickDirection(gp);

    if (direction) {
      newDirection = direction;
    }
  }

  // Handle directional navigation.
  if (newDirection) {
    // Check if this is a new direction or continuation
    if (newDirection !== currentDirection) {
      currentDirection = newDirection;
      isInitialPress = true;
      if (navigate(newDirection)) {
        lastGamepadNavTime = now;
      }
    } else {
      // Same direction held - check for repeat
      const delay = isInitialPress ? GAMEPAD_INITIAL_DELAY_MS : GAMEPAD_REPEAT_DELAY_MS;
      if (now > lastGamepadNavTime + delay) {
        if (navigate(newDirection)) {
          lastGamepadNavTime = now;
          isInitialPress = false;
        }
      }
    }
  } else {
    currentDirection = null;
    isInitialPress = true;
  }

  previousActiveGamepads = activeGamepads;
}

export function setupGamepadNavigation(): () => void {
  if (!("getGamepads" in navigator)) {
    console.error("Gamepad API not supported.");
    return (): void => {
      // Nothing to clean up if gamepad API isn't supported
    };
  }

  const connectHandler = (e: GamepadEvent) => {
    gamepads[e.gamepad.index] = e.gamepad;
    if (!gamepadPollIntervalId && Object.keys(gamepads).length > 0) {
      gamepadPollIntervalId = window.setInterval(handleGamepadInput, GAMEPAD_POLL_INTERVAL);
    }
  };

  const disconnectHandler = (e: GamepadEvent) => {
    // Use Reflect.deleteProperty instead of delete operator
    Reflect.deleteProperty(gamepads, e.gamepad.index);
    if (Object.keys(gamepads).length === 0 && gamepadPollIntervalId) {
      clearInterval(gamepadPollIntervalId);
      gamepadPollIntervalId = null;
    }
  };

  window.addEventListener("gamepadconnected", connectHandler);
  window.addEventListener("gamepaddisconnected", disconnectHandler);

  const initialGamepads = navigator.getGamepads();
  for (const gamepad of Array.from(initialGamepads)) {
    if (gamepad) {
      gamepads[gamepad.index] = gamepad;
    }
  }

  if (Object.keys(gamepads).length > 0 && !gamepadPollIntervalId) {
    gamepadPollIntervalId = window.setInterval(handleGamepadInput, GAMEPAD_POLL_INTERVAL);
  }

  return () => {
    window.removeEventListener("gamepadconnected", connectHandler);
    window.removeEventListener("gamepaddisconnected", disconnectHandler);
    if (gamepadPollIntervalId) clearInterval(gamepadPollIntervalId);
    gamepadPollIntervalId = null;
  };
}
