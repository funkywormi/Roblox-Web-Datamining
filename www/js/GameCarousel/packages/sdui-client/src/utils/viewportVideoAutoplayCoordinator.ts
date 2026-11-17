import { window as browserWindow } from "@rbx/core-lib/browser";
import {
  VIEWPORT_AUTOPLAY_DWELL_MS,
  VIEWPORT_AUTOPLAY_SCROLL_SETTLE_MS,
} from "../consts/videoAutoplay";

export interface ViewportAutoplayRegistration {
  /** Identifies the video for played-once tracking. The universe ID. */
  key: string;
  element: Element;
  /** Tells the owning tile whether its video should be mounted. */
  setPlaybackRequested: (requested: boolean) => void;
}

export interface ViewportAutoplayHandle {
  setVisible: (isVisible: boolean) => void;
  /**
   * Call when the video plays to the end, or when it cannot play (blocked, failed, or
   * unsupported). The tile gives up its slot and will not autoplay again this page view.
   */
  markEnded: () => void;
  /** Call when the browser blocks autoplay. No tile on the page autoplays for the rest of this page view. */
  markBlocked: () => void;
  unregister: () => void;
}

interface Entry extends ViewportAutoplayRegistration {
  isVisible: boolean;
}

/**
 * Page-wide arbiter for viewport autoplay.
 *
 * - One video plays at a time.
 * - The winner is the current winner while it stays eligible, otherwise the first eligible tile
 *   in DOM order.
 * - A winner plays only after it has been the winner for `VIEWPORT_AUTOPLAY_DWELL_MS`.
 * - Elections pause during scroll. A playing video keeps playing until scrolling settles.
 * - A video that has ended is not elected again.
 * - If the browser blocks autoplay, nothing is elected for the rest of the page view.
 */
export class ViewportVideoAutoplayCoordinator {
  private readonly entries = new Set<Entry>();
  private readonly endedKeys = new Set<string>();
  private winner: Entry | null = null;
  private playing: Entry | null = null;
  private dwellTimeout: ReturnType<typeof setTimeout> | null = null;
  private settleTimeout: ReturnType<typeof setTimeout> | null = null;
  private isScrolling = false;
  private isBlocked = false;

  register(registration: ViewportAutoplayRegistration): ViewportAutoplayHandle {
    const entry: Entry = { ...registration, isVisible: false };
    this.entries.add(entry);
    if (this.entries.size === 1) {
      browserWindow?.addEventListener("scroll", this.handleScroll, {
        capture: true,
        passive: true,
      });
    }

    return {
      setVisible: isVisible => {
        if (entry.isVisible === isVisible) {
          return;
        }
        entry.isVisible = isVisible;
        this.elect();
      },
      markEnded: () => {
        this.endedKeys.add(entry.key);
        if (this.playing === entry) {
          this.stopPlaying();
        }
        this.elect();
      },
      markBlocked: () => {
        this.isBlocked = true;
        this.cancelDwell();
        this.stopPlaying();
        this.winner = null;
      },
      unregister: () => {
        this.entries.delete(entry);
        // The tile is unmounting, so do not call its setter.
        if (this.playing === entry) {
          this.playing = null;
        }
        if (this.winner === entry) {
          this.cancelDwell();
          this.winner = null;
        }
        if (this.entries.size === 0) {
          this.reset();
        } else {
          this.elect();
        }
      },
    };
  }

  private isEligible(entry: Entry): boolean {
    return this.entries.has(entry) && entry.isVisible && !this.endedKeys.has(entry.key);
  }

  private pickWinner(): Entry | null {
    if (this.winner && this.isEligible(this.winner)) {
      return this.winner;
    }

    const eligible = [...this.entries].filter(entry => this.isEligible(entry));
    eligible.sort((a, b) =>
      a.element.compareDocumentPosition(b.element) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1,
    );
    return eligible[0] ?? null;
  }

  private elect(): void {
    if (this.isScrolling || this.isBlocked) {
      return;
    }

    const nextWinner = this.pickWinner();
    if (nextWinner !== this.winner) {
      this.cancelDwell();
      this.winner = nextWinner;
    }

    if (this.playing && this.playing !== this.winner) {
      this.stopPlaying();
    }

    if (this.winner && this.winner !== this.playing && this.dwellTimeout === null) {
      this.startDwell();
    }
  }

  private startDwell(): void {
    this.dwellTimeout = setTimeout(() => {
      this.dwellTimeout = null;
      if (this.winner && !this.isScrolling) {
        this.playing = this.winner;
        this.winner.setPlaybackRequested(true);
      }
    }, VIEWPORT_AUTOPLAY_DWELL_MS);
  }

  private cancelDwell(): void {
    if (this.dwellTimeout !== null) {
      clearTimeout(this.dwellTimeout);
      this.dwellTimeout = null;
    }
  }

  private stopPlaying(): void {
    const { playing } = this;
    this.playing = null;
    playing?.setPlaybackRequested(false);
  }

  private readonly handleScroll = (): void => {
    this.isScrolling = true;
    this.cancelDwell();
    if (this.settleTimeout !== null) {
      clearTimeout(this.settleTimeout);
    }
    this.settleTimeout = setTimeout(() => {
      this.settleTimeout = null;
      this.isScrolling = false;
      this.elect();
    }, VIEWPORT_AUTOPLAY_SCROLL_SETTLE_MS);
  };

  private reset(): void {
    browserWindow?.removeEventListener("scroll", this.handleScroll, { capture: true });
    this.cancelDwell();
    if (this.settleTimeout !== null) {
      clearTimeout(this.settleTimeout);
      this.settleTimeout = null;
    }
    this.winner = null;
    this.playing = null;
    this.isScrolling = false;
    this.isBlocked = false;
    this.endedKeys.clear();
  }
}

let coordinator: ViewportVideoAutoplayCoordinator | undefined;

export function getViewportVideoAutoplayCoordinator(): ViewportVideoAutoplayCoordinator {
  coordinator ??= new ViewportVideoAutoplayCoordinator();
  return coordinator;
}
