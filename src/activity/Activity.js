import SubfolderParser from '../subfolder/SubfolderParser.js';
import SubfolderGrouper from '../subfolder/SubfolderGrouper.js';
import SubfolderServicer from '../subfolder/SubfolderServicer.js';
import SubfolderFilter from '../subfolder/SubfolderFilter.js';
import SubfolderWriter from '../subfolder/SubfolderWriter.js';

export default class Activity {

    #subfolderParser = new SubfolderParser();
    #subfolderGrouper = new SubfolderGrouper();
    #subfolderServicer = new SubfolderServicer();
    #subfolderFilter = new SubfolderFilter();
    #subfolderWriter = new SubfolderWriter();

    activate(input) {
        const units = this.#subfolderParser.parse(input);
        const groups = this.#subfolderGrouper.group(units);
        const calls = this.#subfolderServicer.call(groups);
        const filtered = this.#subfolderFilter.filter(calls);
        this.#subfolderWriter.writeToDestination(filtered);
    }

}
