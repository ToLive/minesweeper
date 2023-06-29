import Field from './Field.js';
import SoundController from './SoundController.js';

export default class Game {
    constructor() {
        this.field = new Field(10, 10, 10, this);
        this.soundController = new SoundController();
    }

    getSoundController() {
        return this.soundController;
    }

    init() {
        this.field.init();
    }
}
