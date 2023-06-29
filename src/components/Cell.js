export default class Cell {
    constructor(x, y, size, opened = false, mined = false, flagged = false, num = 0) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.cellNumber = num;
        this.cellContainer = document.createElement('div');
        this.mine = mined;
        this.open = opened;
        this.flagged = flagged;

        if (mined) {
            this.setMine();
        }

        if (opened) {
            this.setOpen();
        }

        if (flagged) {
            this.setFlagged();
        }

        this.cellNumberColorsLight = {
            1: '#3f4041',
            2: '#893998',
            3: '#f77410',
            4: '#225354',
            5: '#3c3c25',
            6: '#c01b0a',
            7: '#fa95a9',
            8: '#937408',
        };

        this.cellNumberColorsDark = {
            1: '#aeaeae',
            2: '#815dff',
            3: '#f77f00',
            4: '#4c8781',
            5: '#848953',
            6: '#b44d3c',
            7: '#ff4d80',
            8: '#e6b800',
        };

        this.cellNumberColor = '';

        if (num > 0) {
            this.setNumber(num);
        }
    }

    setMine() {
        this.mine = true;
        this.setNumber(-1);
    }

    setOpen() {
        this.open = true;

        if (this.isMined() && !this.isFlagged()) {
            this.cellContainer.classList.add('mine');

            return;
        }

        if (this.isMined() && this.isFlagged()) {
            this.cellContainer.classList.add('success');

            return;
        }

        if (this.cellNumber > 0 && !this.isFlagged()) {
            this.cellContainer.innerText = this.cellNumber;
            this.cellContainer.classList.add('open');

            return;
        }

        if (this.cellNumber > 0 && this.isFlagged()) {
            this.cellContainer.classList.add('open', 'fail');

            return;
        }

        if (this.cellNumber === 0) {
            this.cellContainer.classList.add('open');
        }
    }

    setFlagged() {
        this.flagged = true;

        this.cellContainer.classList.add('flagged');
    }

    setTheme(theme = 'Light') {
        if (this.cellNumber < 0) {
            return;
        }

        if (theme === 'Light') {
            this.cellNumberColor = this.cellNumberColorsLight[this.cellNumber];
        }

        if (theme === 'Dark') {
            this.cellNumberColor = this.cellNumberColorsDark[this.cellNumber];
        }

        this.cellContainer.style.color = this.cellNumberColor;
    }

    removeFlagged() {
        this.flagged = false;

        this.cellContainer.classList.remove('flagged');
    }

    isFlagged() {
        return this.flagged;
    }

    isOpened() {
        return this.open;
    }

    isMined() {
        return this.mine;
    }

    setNumber(num, theme = 'Light') {
        this.cellNumber = num;
        this.setTheme(theme);

        /* if (num > 0) {
            this.cellNumberColor = this.cellNumberColorsLight[num];

            this.cellContainer.style.color = this.cellNumberColor;
        } */
    }

    getNumber() {
        return this.cellNumber;
    }

    getCell() {
        this.cellContainer.dataset.x = this.x;
        this.cellContainer.dataset.y = this.y;
        this.cellContainer.classList.add('cell');
        this.cellContainer.classList.add(this.size);
        this.cellContainer.style.aspectRatio = '1 / 1';

        return this.cellContainer;
    }
}
