import SubfolderParser from './subfolder/SubfolderParser.js';
import SubfolderGrouper from './subfolder/SubfolderGrouper.js';
import SubfolderServicer from './subfolder/SubfolderServicer.js';
import DestinationClient from './subfolder/SubfolderWriter.js';

export default class Activity {

    #subfolderParser = new SubfolderParser();
    #subfolderGrouper = new SubfolderGrouper();
    #subfolderServicer = new SubfolderServicer();
    #destinationClient = new DestinationClient();

    activate(input) {
        const units = this.#subfolderParser.parse(input);
        units.sort((u1, u2) => u1[0].localeCompare(u2[0]));
        const groups = this.#subfolderGrouper.group(units);
        const calls = this.#subfolderServicer.call(groups);
        const filtered = calls.map(g =>
            g.filter(c => !(
                c.params[1] === process.env.CRITERIA1 &&
                c.params[2] === process.env.CRITERIA2
            ))
        );
        this.#destinationClient.writeToDestination(filtered);
    }

}
