import Fry from '../assets/images/fry.png';
import Bender from '../assets/images/bender.png';
import Professor from '../assets/images/professor.png';
import Express from '../assets/images/express.png';
import Cell from './Cell.js';

export default class Field {
    constructor(rows, cols, minesCnt, gameInstance) {
        this.rows = rows;
        this.cols = cols;
        this.minesCnt = minesCnt;
        this.flagCounter = 0;
        this.openedCellsCnt = 0;
        this.flaggedCells = [];
        this.moves = 0;
        this.gameInstance = gameInstance;

        this.theme = this.getSettings().theme;

        this.SURROUND_CELLS = [
            [-1, -1],
            [-1, 0],
            [-1, 1],
            [0, -1],
            [0, 1],
            [1, -1],
            [1, 0],
            [1, 1],
        ];

        this.cellSize = 'large';
        this.field = Array.from({ length: this.rows }, () => new Array(this.cols));

        this.gameContainer = document.createElement('div');

        document.body.appendChild(this.gameContainer);
    }

    getCell(x, y) {
        return this.field[x][y];
    }

    calcCellNumber(x, y) {
        let cellNumber = 0;

        this.SURROUND_CELLS.forEach(([xN, yN]) => {
            const xIdx = x + xN;
            const yIdx = y + yN;

            const isCellExists = (xo, yo) => (
                xo >= 0
                && yo >= 0
                && xo < this.rows
                && yo < this.cols
            );

            if (isCellExists(xIdx, yIdx)
                && this.getCell(xIdx, yIdx).isMined()) {
                cellNumber += 1;
            }
        });

        this.getCell(x, y).setNumber(cellNumber, this.theme);
    }

    openCell(cell) {
        cell.setOpen();

        this.gameInstance.getSoundController().playOpenCellEffect();

        this.openedCellsCnt += 1;
    }

    openNeighbors(x, y) {
        this.SURROUND_CELLS.forEach(([xN, yN]) => {
            const xIdx = xN + Number(x);
            const yIdx = yN + Number(y);

            const isCellExists = (xo, yo) => (
                xo >= 0
                && yo >= 0
                && xo < this.rows
                && yo < this.cols
            );

            if (isCellExists(xIdx, yIdx)) {
                const cell = this.getCell(xIdx, yIdx);

                if (!cell.isOpened() && !cell.isMined() && !cell.isFlagged()) {
                    this.openCell(cell);

                    if (cell.cellNumber === 0) {
                        this.openNeighbors(xIdx, yIdx);
                    }
                }
            }
        });
    }

    handleEndGame() {
        clearInterval(this.timerLink);
    }

    handleGameOver() {
        this.handleEndGame();

        this.field.map((row) => row.map((cell) => this.openCell(cell)));
        this.gameover = true;

        this.statusText.textContent = ('Game over. Try again');
        this.writeHighScore(`Lose, ${this.rows}x${this.cols}, ${this.minesCnt} mines in ${this.timer} seconds and ${this.moves} moves`);

        const soundController = this.gameInstance.getSoundController();
        soundController.playLose();
    }

    changeFlagCounter(n) {
        this.flagCounter += n;

        this.renderFlags();
    }

    increaseMoves() {
        this.moves += 1;

        this.renderMoves();
    }

    getHighScore() {
        this.highScores = JSON.parse(localStorage.getItem('tolive-minesweeper-highscores')) || [];

        const highscoreList = this.highScores.slice(-10).reduce((acc, value, index) => `${acc}<br/>${index + 1}. ${value}<br>`, '');
        const highscoreContent = this.highscoresPopup.querySelector('#highscores');
        highscoreContent.innerHTML = highscoreList;
    }

    writeHighScore(score) {
        this.getHighScore();
        this.highScores.push(score);

        localStorage.setItem('tolive-minesweeper-highscores', JSON.stringify(this.highScores));
    }

    checkWinGame() {
        if (this.openedCellsCnt + this.minesCnt === this.rows * this.cols) {
            this.handleEndGame();

            this.statusText.textContent = (`Hooray! You found all mines in ${this.timer} seconds and ${this.moves} moves!`);
            this.writeHighScore(`Win, ${this.rows}x${this.cols}, ${this.minesCnt} mines in ${this.timer} seconds and ${this.moves} moves`);

            const soundController = this.gameInstance.getSoundController();
            soundController.playWin();

            this.gameover = true;

            return true;
        }

        return false;
    }

    handleCellClick(event) {
        if (this.gameover) {
            return;
        }

        const { x, y } = event.target.dataset;
        const clickedCell = this.getCell(x, y);

        // first move
        if (this.openedCellsCnt === 0) {
            this.gameInstance.getSoundController().playMusic();
            this.setMines(clickedCell);
        }

        if (clickedCell.isFlagged() || clickedCell.isOpened()) {
            return;
        }

        this.openCell(clickedCell);

        this.increaseMoves();

        if (clickedCell.cellNumber === 0) {
            this.openNeighbors(x, y);
        }

        if (clickedCell.isMined()) {
            this.handleGameOver();

            return;
        }

        this.checkWinGame();
    }

    handleCellRightClick(event) {
        event.preventDefault();

        if (this.gameover) {
            return;
        }

        const { x, y } = event.target.dataset;
        const clickedCell = this.getCell(Number(x), Number(y));

        if (!clickedCell.isOpened() && !clickedCell.isFlagged()) {
            clickedCell.setFlagged();

            this.flaggedCells.push(clickedCell);

            this.changeFlagCounter(1);

            const soundController = this.gameInstance.getSoundController();
            soundController.playFlagEffect();

            this.checkWinGame();

            return;
        }

        if (clickedCell.isFlagged()) {
            clickedCell.removeFlagged();

            this.flaggedCells = this.flaggedCells
                .filter((cell) => !(cell.x === Number(x) && cell.y === Number(y)));

            this.changeFlagCounter(-1);

            const soundController = this.gameInstance.getSoundController();
            soundController.playFlagEffect();

            this.checkWinGame();
        }
    }

    renderField(savedField) {
        this.fieldContainer = document.createElement('div');
        this.fieldContainer.classList.add('field');

        for (let i = 0; i < this.cols; i += 1) {
            const row = document.createElement('div');
            row.classList.add('row');
            row.dataset.y = i;

            for (let k = 0; k < this.rows; k += 1) {
                let cell;
                if (!savedField) {
                    cell = new Cell(k, i, this.cellSize);
                } else {
                    const {
                        x, y, opened, mined, flagged, num,
                    } = savedField[k][i];

                    cell = new Cell(x, y, this.cellSize, opened, mined, flagged, num);

                    if (flagged) {
                        this.flaggedCells.push(cell);
                    }
                }

                cell.getCell().addEventListener('click', (ev) => this.handleCellClick(ev));

                cell.getCell().addEventListener('contextmenu', (ev) => this.handleCellRightClick(ev), false);

                this.field[k][i] = cell;

                row.appendChild(cell.getCell());
            }

            this.fieldContainer.appendChild(row);
        }

        this.gameContainer.appendChild(this.fieldContainer);

        this.startClock(this.timer);
    }

    renderMoves() {
        document.getElementById('moves').textContent = this.moves.toString().padStart(3, '0');
    }

    renderFlags() {
        document.getElementById('flags').textContent = this.flagCounter.toString().padStart(3, '0');

        const minesRemaining = this.minesCnt - this.flagCounter;

        document.getElementById('mines').textContent = (minesRemaining >= 0 ? minesRemaining : 0).toString().padStart(3, '0');
    }

    startClock(savedTimer = 0) {
        this.timer = savedTimer;

        const updateClock = () => {
            this.timer += 1;

            const second = this.timer.toString().padStart(3, '0');

            document.getElementById('seconds').textContent = second;
        };

        this.timerLink = setInterval(updateClock, 1000);
    }

    renderControls() {
        this.gameControl = document.createElement('div');
        this.gameControl.classList.add('control');

        const clock = `<div class="clock">
            <img class="clock-img" src="${Express}" />
            <div class="digit-block">            
            <span id="seconds" class="digit">000</span>
            <span class="char-text">Time</span>
            </div> 
        </div>`;

        const moves = `<div class="clock">
            <img class="clock-img" src="${Professor}" /> 
            <div class="digit-block">
                <span id="moves" class="digit">000</span>
                <span class="char-text">Moves</span>
            </div>               
            
        </div>`;

        const flags = `<div class="clock">            
            <img class="clock-img" src="${Fry}" />
            <div class="digit-block">    
            <span id="flags" class="digit">000</span>
            <span class="char-text">Flags</span>
            </div> 
        </div>`;

        const mines = `<div class="clock">
            <img class="clock-img" src="${Bender}" />
            <div class="digit-block">    
            <span id="mines" class="digit">${this.minesCnt.toString().padStart(3, '0')}</span>
            <span class="char-text">Mines</span>
            </div> 
        </div>`;

        const themeToggle = `<div class="switch-container"><span id="switch-text">${this.theme}</span>
        <label class="switch"><input id="theme-switch" type="checkbox" ${this.theme === 'Dark' ? 'checked' : ''} />
        <div></div>
        </label>
        </div>`;

        this.gameControl.insertAdjacentHTML('afterBegin', themeToggle);
        this.gameControl.insertAdjacentHTML('afterBegin', moves);
        this.gameControl.insertAdjacentHTML('afterBegin', mines);
        this.gameControl.insertAdjacentHTML('afterBegin', flags);
        this.gameControl.insertAdjacentHTML('afterBegin', clock);

        this.gameControl.querySelector('#theme-switch').addEventListener('click', () => this.handleThemeSwitch());

        this.gameContainer.appendChild(this.gameControl);
    }

    setLightTheme() {
        const switchText = document.querySelector('#switch-text');

        document.documentElement.classList.remove('dark');
        switchText.textContent = 'Light';
        switchText.classList.remove('dark');

        this.field.forEach((row) => {
            row.forEach((cell) => {
                cell.getCell().classList.remove('dark');
                cell.setTheme('Light');
            });
        });

        document.querySelectorAll('.game-button').forEach((elem) => elem.classList.remove('dark'));
        this.gameStatus.classList.remove('dark');
        this.gameControl.classList.remove('dark');
        this.statusText.classList.remove('dark');
    }

    setDarkTheme() {
        const switchText = document.querySelector('#switch-text');

        document.documentElement.classList.add('dark');
        switchText.textContent = 'Dark';
        switchText.classList.add('dark');

        this.field.forEach((row) => {
            row.forEach((cell) => {
                cell.getCell().classList.add('dark');
                cell.setTheme('Dark');
            });
        });

        document.querySelectorAll('.game-button').forEach((elem) => elem.classList.add('dark'));

        this.gameStatus.classList.add('dark');
        this.gameControl.classList.add('dark');
        this.statusText.classList.add('dark');

        this.saveSettings();
    }

    handleThemeSwitch() {
        if (this.theme === 'Light') {
            this.theme = 'Dark';

            this.setDarkTheme();

            return;
        }

        if (this.theme === 'Dark') {
            this.theme = 'Light';

            this.setLightTheme();

            this.saveSettings();
        }
    }

    saveSettings() {
        const settings = {
            theme: this.theme,
            music: this.gameInstance.getSoundController().getSettings().music,
            sfx: this.gameInstance.getSoundController().getSettings().sfx,
        };

        localStorage.setItem('tolive-minesweeper-settings', JSON.stringify(settings));
    }

    getSettings() {
        const defaults = {
            theme: 'Light',
            music: true,
            sfx: true,
        };

        this.savedSettings = JSON.parse(localStorage.getItem('tolive-minesweeper-settings'));

        if (this.savedSettings) {
            return { ...defaults, ...this.savedSettings };
        }

        return defaults;
    }

    renderGameStatus() {
        this.gameStatus = document.createElement('div');
        this.gameStatus.classList.add('status');

        this.statusText = document.createElement('span');
        this.statusText.classList.add('status-text');

        this.gameStatus.appendChild(this.statusText);
        this.gameContainer.appendChild(this.gameStatus);
    }

    renderNewGamePopup() {
        this.newGamePopup = document.createElement('div');
        this.newGamePopup.className = 'new-game-popup hide';
        this.newGamePopup.innerHTML = `
            <div class="popup-content">
                <fieldset>
                <legend>Select game difficulty:</legend>
            
                <div>
                <input type="radio" id="easy" name="game" value="easy"
                        checked>
                <label for="easy">Easy, 10x10</label>
                </div>
            
                <div>
                <input type="radio" id="medium" name="game" value="medium">
                <label for="medium">Medium, 15x15</label>
                </div>
            
                <div>
                <input type="radio" id="hard" name="game" value="hard">
                <label for="hard">Hard, 25x25</label>
                </div>
            </fieldset>
            <div class="slidecontainer">
            <input type="range" min="10" max="99" value="10" class="slider" id="mines-cnt">
            <label id="slider-label" for="minesCnt">Mines count: 10</label>
            </div>
                <button id="start-game">Start game</button>
                <button id="close-popup">Close</button>
            </div>`;
        const minesSlider = this.newGamePopup.querySelector('#mines-cnt');
        const minesSliderLabel = this.newGamePopup.querySelector('#slider-label');
        minesSlider.addEventListener('change', (e) => {
            minesSliderLabel.textContent = `Mines count: ${e.target.value}`;
        });

        this.highscoresPopup = document.createElement('div');
        this.highscoresPopup.className = 'highscores-popup hide';
        this.highscoresPopup.innerHTML = `
            <div class="popup-content">
            <div id="highscores"></div>
            <button id="close-highscores-popup">Close</button>
            </div>`;

        const closeHighscores = this.highscoresPopup.querySelector('#close-highscores-popup');
        closeHighscores.addEventListener('click', () => {
            this.highscoresPopup.classList.add('hide');
            this.highscoresPopup.classList.remove('show');
        });

        const gameConfig = {
            easy: { rows: 10, cols: 10 },
            medium: { rows: 15, cols: 15 },
            hard: { rows: 25, cols: 25 },
        };

        const startButton = this.newGamePopup.querySelector('#start-game');
        startButton.addEventListener('click', () => {
            const gameDifficulty = document.querySelector('input[name="game"]:checked').value;
            const { rows, cols } = gameConfig[gameDifficulty];

            this.restartGame(rows, cols, Number(minesSlider.value));
            this.newGamePopup.classList.add('hide');
            this.newGamePopup.classList.remove('show');
        });

        const closeButton = this.newGamePopup.querySelector('#close-popup');
        closeButton.addEventListener('click', () => {
            this.newGamePopup.classList.add('hide');
            this.newGamePopup.classList.remove('show');
        });

        this.gameContainer.appendChild(this.newGamePopup);
        this.gameContainer.appendChild(this.highscoresPopup);
    }

    renderButtons() {
        this.buttonsContainer = document.createElement('div');
        this.buttonsContainer.classList.add('buttons');

        this.newGameButton = document.createElement('button');
        this.newGameButton.classList.add('new-game', 'game-button');
        this.newGameButton.textContent = 'New Game';
        this.newGameButton.addEventListener('click', () => {
            this.newGamePopup.classList.add('show');
        });

        this.highscoresButton = document.createElement('button');
        this.highscoresButton.classList.add('highscores', 'game-button');
        this.highscoresButton.textContent = 'Highscores';
        this.highscoresButton.addEventListener('click', () => {
            this.getHighScore();
            this.highscoresPopup.classList.add('show');
        });

        this.saveGameButton = document.createElement('button');
        this.saveGameButton.classList.add('save-game', 'game-button');
        this.saveGameButton.textContent = 'Save Game';
        this.saveGameButton.addEventListener('click', () => {
            this.saveGame();
        });

        this.loadGameButton = document.createElement('button');
        this.loadGameButton.classList.add('load-game', 'game-button');
        this.loadGameButton.textContent = 'Load Game';
        this.loadGameButton.addEventListener('click', () => {
            this.loadGame();
        });

        // const soundController = this.gameInstance.getSoundController();
        // const soundSettings = soundController.getSettings();

        this.musicButton = document.createElement('button');
        this.musicButton.classList.add('music-switch', 'game-button');
        this.musicButton.textContent = `Music ${this.getSettings().music ? 'on' : 'off'}`;
        this.musicButton.addEventListener('click', () => {
            const { music } = this.getSettings();

            if (music) {
                this.gameInstance.getSoundController().disableMusic();
                this.musicButton.textContent = 'Music off';

                this.saveSettings();

                return;
            }

            this.gameInstance.getSoundController().enableMusic();
            this.musicButton.textContent = 'Music on';

            this.saveSettings();
        });

        this.sfxButton = document.createElement('button');
        this.sfxButton.classList.add('sfx-switch', 'game-button');
        this.sfxButton.textContent = `Sfx ${this.getSettings().sfx ? 'on' : 'off'}`;
        this.sfxButton.addEventListener('click', () => {
            const { sfx } = this.getSettings();

            if (sfx) {
                this.gameInstance.getSoundController().disableSfx();
                this.sfxButton.textContent = 'Sfx off';

                this.saveSettings();

                return;
            }

            this.gameInstance.getSoundController().enableSfx();
            this.sfxButton.textContent = 'Sfx on';

            this.saveSettings();
        });

        this.buttonsContainer.appendChild(this.newGameButton);
        this.buttonsContainer.appendChild(this.highscoresButton);
        this.buttonsContainer.appendChild(this.saveGameButton);
        this.buttonsContainer.appendChild(this.loadGameButton);
        this.buttonsContainer.appendChild(this.musicButton);
        this.buttonsContainer.appendChild(this.sfxButton);
        this.gameContainer.appendChild(this.buttonsContainer);
    }

    setMines(cell) {
        this.minesSetup = [];

        const choiceArray = [];

        // fill array with cell indexes
        for (let i = 0; i < this.cols; i += 1) {
            for (let j = 0; j < this.rows; j += 1) {
                const coords = `${i}-${j}`;

                if (`${cell.x}-${cell.y}` !== coords) {
                    choiceArray.push(coords);
                }
            }
        }

        for (let n = 0; n < this.minesCnt; n += 1) {
            const index = Math.floor(Math.random() * (this.rows * this.cols - n - 1));
            const choice = choiceArray[index];

            choiceArray.splice(index, 1);
            this.minesSetup.push(choice);

            const [x, y] = choice.split('-');
            const minedCell = this.getCell(x, y);

            minedCell.setMine();
        }

        for (let i = 0; i < this.cols; i += 1) {
            for (let k = 0; k < this.rows; k += 1) {
                if (!this.field[k][i].isMined()) {
                    this.calcCellNumber(k, i);
                }
            }
        }
    }

    saveGame() {
        const state = {
            rows: this.rows,
            cols: this.cols,
            timer: this.timer,
            moves: this.moves,
            mines: this.minesCnt,
            minesSetup: this.minesSetup,
            field: [],
        };

        this.field.forEach((row) => {
            const newRow = [];

            row.forEach((cell) => {
                newRow.push({
                    x: cell.x,
                    y: cell.y,
                    opened: cell.isOpened(),
                    mined: cell.isMined(),
                    flagged: cell.isFlagged(),
                    num: cell.getNumber(),
                });
            });

            state.field.push(newRow);
        });

        localStorage.setItem('tolive_minesweeper_save', JSON.stringify(state));
    }

    loadGame() {
        const {
            rows, cols, timer, moves, minesSetup, field,
        } = JSON.parse(localStorage.getItem('tolive_minesweeper_save'));

        this.restartGame(rows, cols, minesSetup.length, timer, moves, field);
    }

    restartGame(rows = 10, cols = 10, mines = 10, timer = 0, moves = 0, field = []) {
        clearInterval(this.timerLink);
        this.statusText.textContent = '';

        this.flagCounter = 0;
        this.openedCellsCnt = 0;

        field.forEach((row) => {
            row.forEach((cell) => {
                if (cell.flagged) {
                    this.flagCounter += 1;
                }

                if (cell.opened) {
                    this.openedCellsCnt += 1;
                }
            });
        });

        this.gameover = false;
        this.flaggedCells = [];

        this.moves = moves;
        this.timer = timer;

        this.fieldContainer.remove();

        switch (rows) {
        case 10:
            this.cellSize = 'large';
            break;
        case 15:
            this.cellSize = 'medium';
            break;
        case 25:
            this.cellSize = 'small';
            break;
        default:
            break;
        }

        this.rows = rows;
        this.cols = cols;
        this.minesCnt = mines;
        this.field = Array.from({ length: this.rows }, () => new Array(this.cols));

        this.renderField(field.length > 0 ? field : null);
        this.renderMoves();
        this.renderFlags();

        if (this.theme === 'Light') {
            this.setLightTheme();
        } else {
            this.setDarkTheme();
        }

        const { music, sfx } = this.getSettings();

        if (music) {
            this.gameInstance.getSoundController().enableMusic();
        } else {
            this.gameInstance.getSoundController().disableMusic();
        }

        if (sfx) {
            this.gameInstance.getSoundController().enableSfx();
        } else {
            this.gameInstance.getSoundController().disableSfx();
        }

        this.gameInstance.getSoundController().playMusic();
    }

    init() {
        this.renderControls();
        this.renderGameStatus();
        this.renderButtons();
        this.renderNewGamePopup();
        this.renderField();

        if (this.theme === 'Light') {
            this.setLightTheme();
        } else {
            this.setDarkTheme();
        }

        const { music, sfx } = this.getSettings();

        if (music) {
            this.gameInstance.getSoundController().enableMusic(false);
        } else {
            this.gameInstance.getSoundController().disableMusic();
        }

        if (sfx) {
            this.gameInstance.getSoundController().enableSfx();
        } else {
            this.gameInstance.getSoundController().disableSfx();
        }
    }
}
