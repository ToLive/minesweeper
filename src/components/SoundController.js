import backgroundMusic from '../assets/sound/futurama-background.ogg';
import openCell from '../assets/sound/open-cell.wav';
import win from '../assets/sound/win.mp3';
import lose from '../assets/sound/lose.mp3';
import flag from '../assets/sound/flag.wav';

export default class SoundController {
    constructor(enableMusic = true, enableSfx = true) {
        this.isSfxEnabled = enableSfx;
        this.isMusicEnabled = enableMusic;
        this.audioContainer = document.createElement('div');

        const { body } = document;

        this.backgroundMusic = document.createElement('audio');
        this.backgroundMusic.src = backgroundMusic;
        this.backgroundMusic.volume = 0.3;
        this.backgroundMusic.loop = true;

        this.audioContainer.appendChild(this.backgroundMusic);
        body.appendChild(this.audioContainer);

        this.openCellEffect = document.createElement('audio');
        this.openCellEffect.src = openCell;
        this.openCellEffect.volume = 0.2;

        this.audioContainer.appendChild(this.openCellEffect);
        body.appendChild(this.audioContainer);

        this.flagEffect = document.createElement('audio');
        this.flagEffect.src = flag;
        this.flagEffect.volume = 0.2;

        this.audioContainer.appendChild(this.flagEffect);
        body.appendChild(this.audioContainer);

        this.winEffect = document.createElement('audio');
        this.winEffect.src = win;

        this.audioContainer.appendChild(this.winEffect);
        body.appendChild(this.audioContainer);

        this.loseEffect = document.createElement('audio');
        this.loseEffect.src = lose;

        this.audioContainer.appendChild(this.loseEffect);
        body.appendChild(this.audioContainer);
    }

    getSettings() {
        return {
            sfx: this.isSfxEnabled,
            music: this.isMusicEnabled,
        };
    }

    playOpenCellEffect() {
        if (this.isSfxEnabled) {
            this.flagEffect.currentTime = 0;
            this.openCellEffect.play();
        }
    }

    playFlagEffect() {
        if (this.isSfxEnabled) {
            this.flagEffect.currentTime = 0;
            this.flagEffect.play();
        }
    }

    stopMusic() {
        this.backgroundMusic.pause();
    }

    playMusic() {
        if (this.isMusicEnabled) {
            this.backgroundMusic.play();
        }
    }

    playWin() {
        if (this.isSfxEnabled) {
            this.winEffect.play();
        }
    }

    playLose() {
        if (this.isSfxEnabled) {
            this.loseEffect.play();
        }
    }

    disableMusic() {
        this.isMusicEnabled = false;

        this.stopMusic();
    }

    enableMusic(playMusic = true) {
        this.isMusicEnabled = true;

        if (playMusic) {
            this.playMusic();
        }
    }

    disableSfx() {
        this.isSfxEnabled = false;
    }

    enableSfx() {
        this.isSfxEnabled = true;
    }
}
