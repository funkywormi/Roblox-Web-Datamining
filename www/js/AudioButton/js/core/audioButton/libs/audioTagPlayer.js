/*
Example usage:
import AudioTagPlayer from "./audioTagPlayer.js";

let audioPlayer = AudioTagPlayer(string audioUrl);

// audioPlayer.play()
audioPlayer.play().then((result) => {
    // play returns promise that is resolved when audio finishes playing
    // result is an object that contains the status of what happened
    // result : {
    //     paused: false
    // }
}).catch((err) => {
    // An error occurred while trying to play the audio (e.g. failed to load)
});

// audioPlayer.pause()
// Returns nothing, just pauses the audio at its current time.
// When play is called again it will resume from the time it was paused at.
audioPlayer.pause();

// audioPlayer.stop()
// Returns nothing, stops the audio and resets the current time back to zero.
// When play is called again it will start from the beginning of the audio.
audioPlayer.stop();

// audioPlayer.isPlaying()
// Returns boolean indicating whether or not the audio is actively playing.
// May return false immediately after play is called if the audio hasn't finished loading.
let isPlaying = audioPlayer.isPlaying();
console.log("isPlaying:", isPlaying);
*/

const blobToAudioDataUri = (blob) => {
    return new Promise((resolve, reject) => {
        let fileReader = new FileReader();

        fileReader.onload = (result) => {
            resolve(result.target.result);
        };

        fileReader.onerror = (e) => {
            reject(e);
        };

        fileReader.readAsDataURL(blob);
    });
};

const getAudioSrc = (audioUrl) => {
    return new Promise((resolve, reject) => {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", audioUrl);
        xhr.responseType = "arraybuffer";

        xhr.onload = () => {
            if (xhr.status === 200) {
                let audioBlob = new Blob([xhr.response], {
                    type: "audio/mpeg"
                });

                blobToAudioDataUri(audioBlob).then(resolve).catch(reject);
            } else {
                reject({
                    message: "Failed to download audio",
                    xmlHttpRequest: xhr
                });
            }
        };

        xhr.onerror = e => {
            reject(e);
        };

        xhr.send();
    });
};

export default (audioUrl) => {
    const audio = new Audio();
    let error = null;
    let tryPlay = false;
    let loaded = false;
    let playPromises = [];

    const audioPlayer = {
        src: audioUrl,

        isPlaying() {
            if (error) {
                return false;
            }

            return !audio.paused;
        },

        play() {
            return new Promise((resolve, reject) => {
                if (error) {
                    reject(error);
                    return;
                }
    
                let shouldPlay = playPromises.length < 1;
                playPromises.push({
                    resolve: resolve,
                    reject: reject
                });
    
                if (shouldPlay) {
                    tryPlay = true;
    
                    if (loaded) {
                        audio.play();
                    }
                }
            });
        },
    
        pause() {
            tryPlay = false;
    
            if (loaded) {
                audio.pause();
            }
        },
    
        stop() {
            this.pause();
    
            if (loaded) {
                audio.currentTime = 0;
            }
        }
    };

    const stopped = () => {
        // When the audio stops, resolve all the promises that called it to play.
        while (playPromises.length > 0) {
            let promise = playPromises.shift();
            try {
                promise.resolve({
                    // Expose whether or not the audio stopped because it was paused
                    paused: audio.currentTime > 0 && audio.currentTime < audio.duration
                });
            } catch (e) {
                try {
                    promise.reject(e);
                } catch {
                    // The promise reject failed? At least we tried? :thonksmile:
                }
            }
        }
    }
    
    const loadError = (e) => {
        error = e;

        while (playPromises.length > 0) {
            let promise = playPromises.shift();
            try {
                promise.reject(e);
            } catch {
                // The promise reject failed? At least we tried? :thonksmile:
            }
        }
    }

    const loadSuccess = () => {
        loaded = true;

        if (tryPlay) {
            audio.play();
        } else {
            // Resolve any promises in case it was "played and paused" before it finished loading.
            stopped();
        }
    };

    audio.addEventListener("pause", stopped);
    audio.addEventListener("ended", stopped);
    audio.addEventListener("error", loadError);
    audio.addEventListener("canplaythrough", loadSuccess);

    getAudioSrc(audioUrl).then(src => {
        // We could set the audio.src directly to audioUrl, but some browsers have a bug.
        // If the audio comes back gzipped - some browsers won't decode the gzipped response before playing the audio, leading to the audio not playing with a CONTENT_DECODING_FAILED error.
        // By loading the audio via XMLHttpRequest and turning it into a data URI we can make sure the response body is properly decoded.
        // See: https://jira.rbx.com/browse/WEBCORE-6687
        audio.src = src;
    }).catch(loadError);

    return audioPlayer;
};
