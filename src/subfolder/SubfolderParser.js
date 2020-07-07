import SubfolderUnit from './utils/SubfolderUnit.js';

export default class SubfolderParser {

    #separator = ',';
    #delimiter = '|';

    parse(input) {
        return input.split(this.#delimiter)
            .map(u => new SubfolderUnit(
                u.split(this.#separator)
            ));
    }

}
