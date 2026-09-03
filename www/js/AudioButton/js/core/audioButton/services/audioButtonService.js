import MediaPlayerIcons from "../constants/mediaPlayerIcons.js";
import AudioService from "./audioService.js";

const mediaPlayerIconClass = "MediaPlayerIcon";
const audioUrlAttribute = "data-mediathumb-url";
const mutationObserverConfiguration = {
    childList: true,
    subtree: true
};

const audioButtonService = {
    getAudioButtons(audioUrl) {
        return document.querySelectorAll(`.${mediaPlayerIconClass}[${audioUrlAttribute}='${audioUrl}']`);
    },

    getAudioUrl(button) {
        return button.getAttribute(audioUrlAttribute);
    },

    setButtonIcon(button, icon) {
        button.classList.toggle(MediaPlayerIcons.pause, icon === MediaPlayerIcons.pause);
        button.classList.toggle(MediaPlayerIcons.play, icon === MediaPlayerIcons.play);
    },

    setAllButtonIconsByAudioUrl(audioUrl, icon) {
        this.getAudioButtons(audioUrl).forEach(button => {
            this.setButtonIcon(button, icon);
        });
    },

    playAudio(audioPlayer) {
        AudioService.pauseRunningPlayer();
        this.setAllButtonIconsByAudioUrl(audioPlayer.src, MediaPlayerIcons.pause);

        // When playing the audio, tell the audio service which player is running.
        AudioService.setRunningPlayer(audioPlayer);

        audioPlayer.play().then(() => {
            // The audio finished playing :tada:
        }).catch((err) => {
            // Error occurred while playing the audio, what do we do with that error?
            console.error(err);
        }).finally(() => {
            // The audio finished playing, set the icon back to the play icon.
            this.setAllButtonIconsByAudioUrl(audioPlayer.src, MediaPlayerIcons.play);

            let runningPlayer = AudioService.getRunningPlayer();
            if (runningPlayer === audioPlayer) {
                AudioService.setRunningPlayer(null);
            }
        });
    },

    clickAudioButton(button) {
        if (!button.classList.contains(mediaPlayerIconClass)) {
            return;
        }

        let audioUrl = this.getAudioUrl(button);
        if (!audioUrl) {
            return;
        }

        let audioPlayer = AudioService.getAudioPlayer(audioUrl);
        if (audioPlayer.isPlaying()) {
            audioPlayer.pause();
        } else {
            this.playAudio(audioPlayer);
        }
    },

    verifyRunningAudio() {
        // Make sure running audio has a button associated with it, in case it was removed.
        let runningPlayer = AudioService.getRunningPlayer();
        if (!runningPlayer || !runningPlayer.isPlaying()) {
            // Nothing playing, nothing left to check.
            return;
        }

        let buttons = this.getAudioButtons(runningPlayer.src);
        if (buttons.length < 1) {
            // No buttons associated with the audio, stop the audio.
            runningPlayer.stop();
        }
    }
};

// Add "button click" event
document.addEventListener("click", (e) => audioButtonService.clickAudioButton(e.target));

// Add "button removed" listener
let mutationObserver = new MutationObserver(audioButtonService.verifyRunningAudio.bind(audioButtonService));
mutationObserver.observe(document, mutationObserverConfiguration);

export default audioButtonService;
