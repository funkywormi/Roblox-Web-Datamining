import AudioTagPlayer from "../libs/audioTagPlayer.js";

let audioPlayers = {};
let runningAudioPlayer = null;

export default {
    getAudioPlayer(audioUrl) {
        let audioPlayer = audioPlayers[audioUrl];
        if (!audioPlayer) {
            audioPlayer = audioPlayers[audioUrl] = AudioTagPlayer(audioUrl);
        }
    
        return audioPlayer;
    },

    pauseRunningPlayer() {
        if (runningAudioPlayer) {
            runningAudioPlayer.pause();
            runningAudioPlayer = null;
        }
    },

    getRunningPlayer() {
        return runningAudioPlayer;
    },

    setRunningPlayer(audioPlayer) {
        runningAudioPlayer = audioPlayer;
    }
};
