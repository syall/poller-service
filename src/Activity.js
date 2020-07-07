import SubfolderParser from './subfolder/SubfolderParser.js';
import SubfolderGrouper from './subfolder/SubfolderGrouper.js';
import SubfolderServicer from './subfolder/SubfolderServicer.js';
import DestinationClient from '../dependencies/DestinationClient.js';

export default class Activity {

    #subfolderParser = new SubfolderParser();
    #subfolderGrouper = new SubfolderGrouper();
    #subfolderServicer = new SubfolderServicer();
    #destinationClient = new DestinationClient();

    activate(input) {
        const units = this.#subfolderParser.parse(input);
        units.sort((u1, u2) => u1[0].localeCompare(u2[0]));
        const [fields, groups] = this.#subfolderGrouper.group(units);
        const calls = this.#subfolderServicer.call(fields, groups);
        const filtered = calls.filter(u => !(u[1] === 'Active' && u[2] === 25));
        this.#destinationClient.writeToDestination(filtered);
    }

}