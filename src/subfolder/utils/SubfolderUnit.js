export default class SubfolderUnit {

    constructor(unit) {
        for (let i = 0; i < unit.length; i++)
            this[i] = unit[i];
    }

}
